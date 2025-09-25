from django.shortcuts import render, redirect, redirect, get_object_or_404
from django.contrib import messages
from .models import Member
from .models import Staff
from .models import StaffSalary ,   SupplementSale
from .models import StaffInvoice, MemberInvoice , LiveSession , OfflineSession ,MembershipPlan , Logos , StaffAttendance
from django.utils import timezone 
from datetime import timedelta, datetime, date
from django.db.models import Sum
from django.utils.timezone import now
from django.core.mail import send_mail, get_connection
import ssl
from django.conf import settings
import time, jwt, base64, hashlib, hmac
import re
from django.db.models import Count
import calendar
from random import randint
from .models import UserAccount , Equipment , ProteinsSale
from .forms import AdminRegisterForm
from .decorators import admin_login_required
from .forms import EquipmentForm





############################################## User Management #################################################

OTP_TIMEOUT = 30  # seconds

# ====================== SEND OTP ==========================
def send_otp_email(email, otp):
    subject = "📩 Your OTP for Clivax Registration"
    message = f"Hello,\n\nYour OTP for registration is: {otp}\nIt will expire in {OTP_TIMEOUT} seconds.\n\nThank you!"
    try:
        ssl_context = ssl._create_unverified_context()
        connection = get_connection(
            host=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            username=settings.EMAIL_HOST_USER,
            password=settings.EMAIL_HOST_PASSWORD,
            use_tls=True,
            fail_silently=False
        )
        connection.ssl_context = ssl_context

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
            connection=connection
        )
        print(f"OTP sent successfully to {email}")
    except Exception as e:
        print(f"Error sending OTP email: {e}")


# ====================== REGISTER ==========================
# ====================== REGISTER ==========================
def admin_register(request):
    otp_sent = False
    email = ""
    error = ""

    if request.method == "POST":
        form = AdminRegisterForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            agreed_terms = form.cleaned_data['agreed_terms']

            if UserAccount.objects.filter(email=email).exists():
                form.add_error('email', "Email already registered")
            else:
                user = UserAccount.objects.create(
                    email=email,
                    username=username,
                    password=password,   # ⚠️ later hashing karna
                    agreed_terms=agreed_terms,
                    is_verified=False
                )

                # Generate OTP
                otp = str(randint(100000, 999999))
                user.otp = otp
                user.save()

                try:
                    send_otp_email(email, otp)
                    otp_sent = True

                    # ✅ Sirf email & OTP time session me save karo
                    request.session['email'] = email
                    request.session['otp_sent_time'] = timezone.now().timestamp()

                except Exception as e:
                    error = f"OTP sending failed: {e}"

                return redirect('otp-verification')  
    else:
        form = AdminRegisterForm()

    return render(request, "app/auth-register.html", {
        "form": form,
        "otp_sent": otp_sent,
        "email": email,
        "error": error
    })

# ====================== OTP VERIFY ==========================

def otp_verification(request):
    if request.method == 'POST':
        email = request.session.get('email') 
        user = UserAccount.objects.filter(email=email).first()

        entered_otp = "".join([
            request.POST.get('otp1', ''),
            request.POST.get('otp2', ''),
            request.POST.get('otp3', ''),
            request.POST.get('otp4', ''),
            request.POST.get('otp5', ''),
            request.POST.get('otp6', ''),
        ])

        if user and user.otp == entered_otp:
            user.is_verified = True
            user.otp = None  
            user.save()

            messages.success(request, "✅ OTP verified successfully. Please login now.")
            return redirect('login')  

        else:
            messages.error(request, "❌ Invalid OTP. Try again.")
            return redirect('otp-verification')

    return render(request, 'app/otp-verification.html')

# ====================== LOGIN ==========================

def login(request):
    # ✅ Already logged-in users ko direct home bhej do
    if request.session.get('user_id'):
        return redirect('home')

    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            user = UserAccount.objects.get(email=email)
        except UserAccount.DoesNotExist:
            messages.error(request, "❌ Invalid email or password.")
            return redirect('login')

        # OTP verify check
        if not user.is_verified:
            messages.error(request, "⚠️ Please verify your email with OTP before login.")
            return redirect('otp-verification')

        # Password check
        if user.password == password:
            # ✅ Session me store karo
            request.session['user_id'] = user.id
            request.session['username'] = user.username
            request.session['email'] = user.email        

            messages.success(request, "✅ Login successful!")
            return redirect('home') 
        else:
            messages.error(request, "❌ Invalid email or password.")
            return redirect('login')

    return render(request, 'app/auth-login.html')

@admin_login_required
def logout_view(request):
    request.session.flush()
    messages.success(request, "✅ You have been logged out successfully.")
    return redirect('login')


@admin_login_required
def admin_other_details(request):
    if request.method == "POST":
        username = request.POST.get("username")
        user = UserAccount.objects.filter(username=username).first()
        if not user:
            messages.error(request, "⚠️ User not found.")
            return redirect("admin-other-details")

        user.first_name = request.POST.get("first_name")
        user.last_name = request.POST.get("last_name")
        user.contact = request.POST.get("contact")
        user.address = request.POST.get("address")
        user.experience = request.POST.get("experience")
        user.about = request.POST.get("about")
        user.education = request.POST.get("education")
        user.certification = request.POST.get("certification")

        if request.FILES.get("profile_image"):
            user.profile_image = request.FILES.get("profile_image")

        user.save()
        messages.success(request, f"✅ Details updated successfully for {user.username}!")
        return redirect("admin-other-details")

    return render(request, "app/admin-other-details.html")


@admin_login_required
def admin_show_profile(request):
    user_id = request.session.get("user_id")
    login_admin = UserAccount.objects.filter(id=user_id).first()

    if not login_admin:
        messages.error(request, "⚠️ Please login first.")
        return redirect("login")

    other_admins = UserAccount.objects.exclude(id=user_id)

    context = {
        "login_admin": login_admin,
        "other_admins": other_admins,
    }
    return render(request, "app/admin-show-profile.html", context)


############################################### Home Page  Management ###########################################

from calendar import monthrange
import json
from decimal import Decimal
from django.db.models import  F, DecimalField, Q

@admin_login_required
def home(request):
    if not request.session.get('user_id'):
        messages.warning(request, "⚠️ Please login first.")
        return redirect("login")

    today = timezone.now().date()

    # ---------------------- Member Stats ----------------------
    total_members = Member.objects.count()
    active_members = Member.objects.filter(expiry_date__gte=today).count()
    next_week = today + timedelta(days=7)
    expiring_soon = Member.objects.filter(
        expiry_date__gte=today, expiry_date__lte=next_week
    ).count()
    expired_members = Member.objects.filter(expiry_date__lt=today).count()

    # ---------------------- Revenue & Due ----------------------
    total_revenue = Member.objects.aggregate(total=Sum("amount_paid"))["total"] or 0
    total_due = Member.objects.aggregate(total=Sum("due_amount"))["total"] or 0
    total_revenue = float(total_revenue)
    total_due = float(total_due)

    # ---------------------- Staff & Sessions ----------------------
    active_trainers = Staff.objects.filter(
        job_post__iexact="Trainer", active=True
    ).count()
    total_live_sessions = LiveSession.objects.count()
    total_offline_sessions = OfflineSession.objects.count()
    total_sessions = total_live_sessions + total_offline_sessions

    # ---------------------- Product Sale Revenue ----------------------
    product_revenue = ProteinsSale.objects.aggregate(
        total=Sum(
            F("product_price") * F("product_quantity"),
            output_field=DecimalField(),
        )
    )["total"] or 0
    product_revenue = float(product_revenue)

    # ---------------------- Birthday Logic ----------------------
    today_birthdays = list(Member.objects.filter(
        dob__month=today.month, dob__day=today.day
    )) + list(Staff.objects.filter(
        dob__month=today.month, dob__day=today.day
    ))

    upcoming_birthdays = list(Member.objects.filter(
        dob__month=today.month, dob__day__gt=today.day
    )) + list(Staff.objects.filter(
        dob__month=today.month, dob__day__gt=today.day
    ))

    # ---------------------- Revenue Graph Data ----------------------
    revenue_months, revenue_values = [], []
    for i in range(11, -1, -1):
        month_date = today - timedelta(days=i * 30)
        year, month = month_date.year, month_date.month
        start_day, end_day = 1, monthrange(year, month)[1]
        month_start = timezone.datetime(year, month, start_day)
        month_end = timezone.datetime(year, month, end_day, 23, 59, 59)

        month_revenue = Member.objects.filter(
            joining_date__range=(month_start, month_end)
        ).aggregate(total=Sum("amount_paid"))["total"] or 0
        revenue_months.append(month_start.strftime("%b %Y"))
        revenue_values.append(float(month_revenue))

    average_revenue = float(total_revenue / 12) if total_revenue else 0
    max_revenue = float(max(revenue_values)) if revenue_values else 0

    # ---------------------- Equipment ----------------------
    total_equipments = Equipment.objects.count()

    # ---------------------- Context ----------------------
    context = {
        "total_members": total_members,
        "active_members": active_members,
        "expired_members": expired_members,
        "expiring_soon": expiring_soon,
        "total_revenue": total_revenue,
        "total_due": total_due,
        "active_trainers": active_trainers,
        "total_sessions": total_sessions,
        "product_revenue": product_revenue,
        "revenue_months": json.dumps(revenue_months),
        "revenue_values": json.dumps(revenue_values),
        "average_revenue": average_revenue,
        "max_revenue": max_revenue,

        # Birthday Data
        "today_birthdays": today_birthdays,
        "upcoming_birthdays": upcoming_birthdays,

        # Equipment
        "total_equipments": total_equipments,
    }

    return render(request, "app/index.html", context)

############################################### Member Management ###########################################

@admin_login_required
def add_new_member(request):
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        contact = request.POST.get('contact')
        gender = request.POST.get('gender')
        dob = request.POST.get('dob')
        address = request.POST.get('address')
        city = request.POST.get('city')
        pincode = request.POST.get('pincode')
        membership_type = request.POST.get('membership_type')
        amount_paid = request.POST.get('amount_paid')
        due_amount = request.POST.get('due_amount')
        joining_date = request.POST.get('joining_date')
        expiry_date = request.POST.get('expiry_date')
        photo = request.FILES.get('photo')

        # ✅ Save Member in DB
        member = Member(
            first_name=first_name,
            last_name=last_name,
            email=email,
            contact=contact,
            gender=gender,
            dob=dob,
            address=address,
            city=city,
            pincode=pincode,
            membership_type=membership_type,
            amount_paid=amount_paid,
            due_amount=due_amount,
            joining_date=joining_date,
            expiry_date=expiry_date,
            photo=photo,
        )
        member.save()

        # ✅ Send Welcome Email
        subject = "🎉 Welcome to Our Gym Family!"
        message = f"""
Hello {member.first_name} {member.last_name},

We are excited to welcome you to our Gym family! 🏋️‍♂️💪

Here are your membership details:
📅 Joining Date: {member.joining_date}
📅 Expiry Date: {member.expiry_date}
💳 Membership Type: {member.membership_type}
💰 Amount Paid: {member.amount_paid}
💸 Due Amount: {member.due_amount}

We look forward to helping you achieve your fitness goals.  
Stay strong, stay motivated!

Thank you,
Your Gym Team
"""

        try:
            ssl_context = ssl._create_unverified_context()

            connection = get_connection(
                host=settings.EMAIL_HOST,
                port=settings.EMAIL_PORT,
                username=settings.EMAIL_HOST_USER,
                password=settings.EMAIL_HOST_PASSWORD,
                use_tls=True,
                fail_silently=False
            )
            connection.ssl_context = ssl_context

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [member.email],
                fail_silently=False,
                connection=connection,
            )
            messages.success(request, f"{member.first_name} {member.last_name} successfully added & welcome email sent! ✅")
        except Exception as e:
            messages.warning(request, f"Member added but email failed: {e}")

        return redirect('add-new-member')   # POST ke baad redirect

    # ✅ GET request: sirf form show karega
    return render(request, 'app/add-new-member.html')


@admin_login_required 
def show_all_member(request):
    members = Member.objects.all().order_by('id')
    return render(request, 'app/show-all-member.html', {
        'members': members
    })




@admin_login_required
def show_member_details(request, id):
    member = get_object_or_404(Member, id=id)
    return render(request, 'app/member-details.html', {'member': member})



@admin_login_required
def update_member(request, id):
    member = get_object_or_404(Member, id=id)

    if request.method == "POST":
        member.first_name = request.POST.get('first_name')
        member.last_name = request.POST.get('last_name')
        member.email = request.POST.get('email')
        member.contact = request.POST.get('contact')
        member.gender = request.POST.get('gender')
        member.dob = request.POST.get('dob')
        member.address = request.POST.get('address')
        member.city = request.POST.get('city')
        member.pincode = request.POST.get('pincode')
        member.membership_type = request.POST.get('membership_type')
        member.amount_paid = request.POST.get('amount_paid')
        member.due_amount = request.POST.get('due_amount')
        member.joining_date = request.POST.get('joining_date')
        member.expiry_date = request.POST.get('expiry_date')

        if request.FILES.get('photo'):
            member.photo = request.FILES['photo']

        member.save()
        messages.success(request, f"{member.first_name} {member.last_name} Updated Successfully!")
        return redirect('show-all-member')

    return render(request, 'app/edit-member.html', {'member': member})





@admin_login_required
def delete_member(request, id):
    members = get_object_or_404(Member, id=id)
    members.delete()
    messages.success(request, "Member deleted successfully!")
    return redirect('show-all-member')



############################################### Staff  Management ###########################################


# add new staff page 


@admin_login_required
def add_new_staff(request):
    if request.method == 'POST':
        email = request.POST.get("email")
        contact = request.POST.get("contact")
        aadhar_number = request.POST.get("aadhar_number")

        # Duplicate checks
        if Staff.objects.filter(email=email).exists():
            messages.error(request, "This email is already registered!")
            return redirect('add-new-staff')

        if Staff.objects.filter(contact=contact).exists():
            messages.error(request, "This contact number already exists!")
            return redirect('add-new-staff')

        if Staff.objects.filter(aadhar_number=aadhar_number).exists():
            messages.error(request, "This Aadhar number already exists!")
            return redirect('add-new-staff')

        try:
            staff = Staff(
                first_name=request.POST.get("first_name"),
                last_name=request.POST.get("last_name"),
                email=email,
                contact=contact,
                gender=request.POST.get("gender"),
                joining_date=request.POST.get("joining_date"),
                job_post=request.POST.get("job_post"),
                photo=request.FILES.get("photo"),
                aadhar_number=aadhar_number,
                pincode=request.POST.get("pincode")
            )
            staff.save()

            # ✅ Email content for staff
            subject = "🎉 Welcome to Our Gym Team!"
            message = f"""
Hello {staff.first_name} {staff.last_name},

Congratulations and welcome to our Gym team! 🏋️‍♂️

Here are your details:
👔 Job Post: {staff.job_post}
📅 Joining Date: {staff.joining_date}
📞 Contact: {staff.contact}
🆔 Aadhar Number: {staff.aadhar_number}

We are excited to have you as a part of our growing family.  
Let’s work together to make fitness accessible and enjoyable for everyone!

Best Regards,  
Your Gym Management
"""

            try:
                # ✅ Custom SSL context (same as live_session & add_member)
                ssl_context = ssl._create_unverified_context()

                connection = get_connection(
                    host=settings.EMAIL_HOST,
                    port=settings.EMAIL_PORT,
                    username=settings.EMAIL_HOST_USER,
                    password=settings.EMAIL_HOST_PASSWORD,
                    use_tls=True,
                    fail_silently=False
                )
                connection.ssl_context = ssl_context

                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [staff.email],
                    fail_silently=False,
                    connection=connection,
                )
                messages.success(request, f"{staff.first_name} {staff.last_name} Successfully Added & Welcome Email Sent ✅")
            except Exception as e:
                messages.warning(request, f"Staff added but email sending failed: {e}")

        except Exception as e:
            messages.error(request, f"Something went wrong: {str(e)}")

        return redirect('add-new-staff')

    return render(request, 'app/add-new-staff.html')


@admin_login_required
def show_all_staff(request):
    members = Staff.objects.all().order_by('id')
    return render(request, 'app/show-all-staff.html', {
        'members': members
    })



@admin_login_required
def manage_staff(request, id):
    staff = get_object_or_404(Staff, id=id)

    if request.method == "POST":
        updated_fields = []

        # First Name
        first_name = request.POST.get("first_name")
        if staff.first_name != first_name:
            updated_fields.append("First Name")
            staff.first_name = first_name

        # Last Name
        last_name = request.POST.get("last_name")
        if staff.last_name != last_name:
            updated_fields.append("Last Name")
            staff.last_name = last_name

        # Email
        email = request.POST.get("email")
        if staff.email != email:
            updated_fields.append("Email")
            staff.email = email

        # Contact
        contact = request.POST.get("contact")
        if staff.contact != contact:
            updated_fields.append("Contact")
            staff.contact = contact

        # Job Post
        job_post = request.POST.get("job_post")
        if staff.job_post != job_post:
            updated_fields.append("Job Role")
            staff.job_post = job_post

        # Joining Date
        joining_date = request.POST.get("joining_date")
        if str(staff.joining_date) != joining_date:
            updated_fields.append("Joining Date")
            staff.joining_date = joining_date

        # Photo
        if request.FILES.get("photo"):
            staff.photo = request.FILES.get("photo")
            updated_fields.append("Photo")

        staff.save()

        if updated_fields:
            messages.success(
                request,
                f"✅ Staff updated successfully. Changed fields: {', '.join(updated_fields)}"
            )
        else:
            messages.info(request, "ℹ️ No changes were made.")

        # Redirect after 3 sec
        return render(request, "app/show-message-redirect.html", {
            "redirect_url": "show-all-staff"
        })

    return render(request, "app/manage-staff.html", {"staff": staff})




@admin_login_required
def delete_staff(request, id):
    staff = get_object_or_404(Staff, id=id)
    staff.delete()
    messages.success(request, "Staff deleted successfully!")
    return redirect('show-all-staff')


############################################### Account Management ###########################################


@admin_login_required
def add_new_salary_account(request):
    if request.method == "POST":
        staff_name = request.POST.get("staffName")
        staff_id = request.POST.get("staffID")
        job_role = request.POST.get("jobRole")
        account_number = request.POST.get("accountNumber")
        bank_name = request.POST.get("bankName")
        salary_amount = request.POST.get("salaryAmount")
        salary_date = request.POST.get("paymentDate")
        salary_mode = request.POST.get("paymentMode")

        # Save to database 
        StaffSalary.objects.create(
            staff_name=staff_name,
            staff_id=staff_id,
            job_role=job_role,
            account_number=account_number,
            bank_name=bank_name,
            salary_amount=salary_amount,
            salary_date=salary_date,
            salary_mode=salary_mode,
        )

        # Send Success message
        messages.success(request, "✅ Salary account added successfully!")
        return redirect("add-new-salary-account") 

    return render(request, "app/add-new-account.html")



@admin_login_required 
def show_sallary_account(request):
    salary_accounts = StaffSalary.objects.all()

    return render(request, 'app/show-all-account.html', {"salary_accounts": salary_accounts})



@admin_login_required
def delete_sallary_account(request, pk):
    account = get_object_or_404(StaffSalary, id=pk)
    account.delete()
    messages.success(request, "❌ Salary account deleted successfully!")
    return redirect('show-all-account')




@admin_login_required
def create_invoice(request):
    if request.method == "POST":
        # -------- STAFF INVOICE --------
        if "staff_submit" in request.POST:
            staff_invoice = StaffInvoice.objects.create(
                staff_name=request.POST.get("staff_name"),
                staff_id=request.POST.get("staff_id"),
                job_role=request.POST.get("job_role"),
                account_number=request.POST.get("account_number"),
                bank_name=request.POST.get("bank_name"),
                salary_amount=request.POST.get("salary_amount"),
                salary_date=request.POST.get("salary_date"),
                payment_mode=request.POST.get("payment_mode"),
            )
            return render(request, "app/staff_invoice_print.html", {"invoice": staff_invoice})

        # -------- MEMBER INVOICE --------
        elif "member_submit" in request.POST:
            member_invoice = MemberInvoice.objects.create(
                member_name=request.POST.get("member_name"),
                member_id=request.POST.get("member_id"),
                membership_type=request.POST.get("membership_type"),
                amount=request.POST.get("amount"),
                billing_date=request.POST.get("billing_date"),
            )
            return render(request, "app/member_invoice_print.html", {"invoice": member_invoice})

    return render(request, "app/create-invoice.html")



@admin_login_required 
def payments(request):
    staff_invoices = StaffInvoice.objects.all().order_by("-created_at")
    member_invoices = MemberInvoice.objects.all().order_by("-created_at")

    context = {
        "staff_invoices": staff_invoices,
        "member_invoices": member_invoices,
    }
    return render(request, "app/pyments.html", context)



############################################### Session Management ###########################################



@admin_login_required
def live_session(request):
    if request.method == "POST":
        session_title = request.POST.get("sessionTitle")
        trainer_name = request.POST.get("trainerName")
        session_datetime_str = request.POST.get("sessionDateTime")

        # Safe conversion for integers
        duration_str = request.POST.get("duration")
        participants_str = request.POST.get("participants")

        duration = int(duration_str) if duration_str and duration_str.isdigit() else 0
        participants = int(participants_str) if participants_str and participants_str.isdigit() else 0

        session_link = request.POST.get("sessionLink")
        note = request.POST.get("note", "")

        # Convert string datetime to Python datetime
        try:
            session_datetime = datetime.fromisoformat(session_datetime_str)
        except Exception:
            messages.error(request, "⚠️ Invalid DateTime format.")
            return redirect("live-session")

        # Save in DB
        new_session = LiveSession.objects.create(
            session_title=session_title,
            trainer_name=trainer_name,
            session_datetime=session_datetime,
            duration=duration,
            participants=participants,
            session_link=session_link,
            note=note
        )

        # ✅ Fetch all member emails
        member_emails = list(Member.objects.values_list("email", flat=True))

        if member_emails:
            subject = f"📢 New Live Session Scheduled: {session_title}"
            message = f"""
Hello Members,

A new live session has been scheduled. Here are the details:

📝 Title: {session_title}
👨‍🏫 Trainer: {trainer_name}
📅 Date & Time: {session_datetime}
⏳ Duration: {duration} minutes
👥 Participants Allowed: {participants}
🔗 Join Link: {session_link}

Note: {note if note else 'No additional notes.'}

Thank you,
Your Team
"""
            try:
                # ✅ Custom SSL context (disable verification for localhost)
                ssl_context = ssl._create_unverified_context()

                connection = get_connection(
                    host=settings.EMAIL_HOST,
                    port=settings.EMAIL_PORT,
                    username=settings.EMAIL_HOST_USER,
                    password=settings.EMAIL_HOST_PASSWORD,
                    use_tls=True,
                    fail_silently=False
                )
                connection.ssl_context = ssl_context  # attach unverified SSL context

                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    member_emails,
                    fail_silently=False,
                    connection=connection,  # use custom connection
                )
                messages.success(request, "✅ Live Session created & Emails sent to all members!")
            except Exception as e:
                messages.error(request, f"⚠️ Session saved but email failed: {e}")
        else:
            messages.warning(request, " Live Session saved but no member emails found.")

        return redirect("live-session")

    #  Fetch all sessions with status
    sessions = LiveSession.objects.all().order_by("-session_datetime")
    current_time = now()

    session_list = []
    for session in sessions:
        start_time = session.session_datetime
        end_time = start_time + timedelta(minutes=session.duration)

        if start_time.date() == current_time.date():
            if start_time <= current_time <= end_time:
                status = ("Ongoing", "info")
            elif current_time < start_time:
                status = ("Today", "success")
            else:
                status = ("Completed", "secondary")
        elif start_time.date() == (current_time + timedelta(days=1)).date():
            status = ("Tomorrow", "warning")
        elif start_time > current_time:
            status = ("Upcoming", "primary")
        else:
            status = ("Completed", "secondary")

        session_list.append({
            "obj": session,
            "status_label": status[0],
            "status_class": status[1]
        })

    return render(request, "app/live-session.html", {
        "sessions": session_list
    })



@admin_login_required
def delete_session(request, session_id):
    session = get_object_or_404(LiveSession, id=session_id)
    session.delete()
    messages.success(request, "✅ Session deleted successfully!")
    return redirect("live-session")  


@admin_login_required
def edit_session(request, session_id):
    session = get_object_or_404(LiveSession, id=session_id)

    if request.method == "POST":
        session.session_title = request.POST.get("sessionTitle")
        session.trainer_name = request.POST.get("trainerName")

        # datetime-local field से datetime parse
        session_datetime_str = request.POST.get("sessionDateTime")
        if session_datetime_str:
            session.session_datetime = datetime.fromisoformat(session_datetime_str)

        session.duration = request.POST.get("duration") or 0
        session.participants = request.POST.get("participants") or 0
        session.session_link = request.POST.get("sessionLink")
        session.note = request.POST.get("note", "")

        session.save()

        # ✅ Fetch all member emails
        member_emails = list(Member.objects.values_list("email", flat=True))

        if member_emails:
            subject = f"✏️ Live Session Updated: {session.session_title}"
            message = f"""
Hello Members,

A live session has been updated. Here are the new details:

📝 Title: {session.session_title}
👨‍🏫 Trainer: {session.trainer_name}
📅 Date & Time: {session.session_datetime}
⏳ Duration: {session.duration} minutes
👥 Participants Allowed: {session.participants}
🔗 Join Link: {session.session_link}

Note: {session.note if session.note else 'No additional notes.'}

Thank you,
Your Team
"""
            try:
                # ✅ Custom SSL context (disable verification for localhost)
                ssl_context = ssl._create_unverified_context()

                connection = get_connection(
                    host=settings.EMAIL_HOST,
                    port=settings.EMAIL_PORT,
                    username=settings.EMAIL_HOST_USER,
                    password=settings.EMAIL_HOST_PASSWORD,
                    use_tls=True,
                    fail_silently=False
                )
                connection.ssl_context = ssl_context  # attach unverified SSL context

                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    member_emails,
                    fail_silently=False,
                    connection=connection,  # use custom connection
                )
                messages.success(request, "✅ Session updated & Emails sent to all members!")
            except Exception as e:
                messages.error(request, f"⚠️ Session updated but email failed: {e}")
        else:
            messages.warning(request, "Session updated but no member emails found.")

        return redirect("live-session")

    return render(request, "app/edit-live-session.html", {"session": session})




@admin_login_required
def generate_zoom_signature(sdk_key, sdk_secret, meeting_number, role):
    ts = int(round(time.time() * 1000)) - 30000
    msg = f"{sdk_key}{meeting_number}{ts}{role}".encode('utf-8')
    secret = sdk_secret.encode('utf-8')

    hash_digest = hmac.new(secret, msg, hashlib.sha256).digest()
    hash_b64 = base64.b64encode(hash_digest).decode('utf-8')

    raw_sig = f"{sdk_key}.{meeting_number}.{ts}.{role}.{hash_b64}"
    return base64.b64encode(raw_sig.encode('utf-8')).decode('utf-8').rstrip("=")



@admin_login_required
def meeting_room(request, session_id):
    session = get_object_or_404(LiveSession, id=session_id)

    zoom_api_key = settings.ZOOM_API_KEY
    zoom_api_secret = settings.ZOOM_API_SECRET

    # Extract meeting number (only digits)
    link = session.session_link
    match = re.search(r"(\d{9,11})", link)
    zoom_meeting_number = match.group(1) if match else ""

    zoom_role = 1  # host

    zoom_signature = generate_zoom_signature(
        zoom_api_key, zoom_api_secret, zoom_meeting_number, zoom_role
    )

    return render(request, "app/meeting-room.html", {
        "session": session,
        "zoom_api_key": zoom_api_key,
        "zoom_meeting_number": zoom_meeting_number,
        "zoom_signature": zoom_signature,
        "zoom_role": zoom_role,
    })


############################################### Offline Session Management ###########################################

@admin_login_required
def offline_session(request):
    if request.method == "POST":
        session_name = request.POST.get("sessionName")
        trainer = request.POST.get("trainerName")
        date_time_str = request.POST.get("sessionDateTime")
        location = request.POST.get("location")
        participants_str = request.POST.get("participants")
        duration_str = request.POST.get("duration")
        notes = request.POST.get("notes", "")

        participants = int(participants_str) if participants_str and participants_str.isdigit() else 0
        duration = int(duration_str) if duration_str and duration_str.isdigit() else 0

        try:
            date_time = datetime.fromisoformat(date_time_str)
        except Exception:
            messages.error(request, "⚠️ Invalid DateTime format.")
            return redirect("offline-session")

        new_session = OfflineSession.objects.create(
            session_name=session_name,
            trainer=trainer,
            date_time=date_time,
            location=location,
            participants=participants,
            duration_minutes=duration,
            notes=notes
        )

        # Email sending code same as before...
        member_emails = list(Member.objects.values_list("email", flat=True))
        if member_emails:
            subject = f"📢 New Offline Session Scheduled: {session_name}"
            message = f"""
Hello Members,

A new offline session has been scheduled. Here are the details:

📝 Title: {session_name}
👨‍🏫 Trainer: {trainer}
📅 Date & Time: {date_time}
⏳ Duration: {duration} minutes
👥 Participants Allowed: {participants}
📍 Location/Zone: {location}

Note: {notes if notes else 'No additional notes.'}

Thank you,
Your Team
"""
            try:
                ssl_context = ssl._create_unverified_context()
                connection = get_connection(
                    host=settings.EMAIL_HOST,
                    port=settings.EMAIL_PORT,
                    username=settings.EMAIL_HOST_USER,
                    password=settings.EMAIL_HOST_PASSWORD,
                    use_tls=True,
                    fail_silently=False
                )
                connection.ssl_context = ssl_context

                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    member_emails,
                    fail_silently=False,
                    connection=connection,
                )
                messages.success(request, "✅ Offline session created & Emails sent to all members!")
            except Exception as e:
                messages.error(request, f"⚠️ Session saved but email failed: {e}")
        else:
            messages.warning(request, "Offline session saved but no member emails found.")

        return redirect("offline-session")

    sessions = OfflineSession.objects.all().order_by('-date_time')
    return render(request, "app/offline-session.html", {"sessions": sessions})


@admin_login_required
def delete_offline_session(request, session_id):
    session = get_object_or_404(OfflineSession, id=session_id)
    session.delete()
    messages.success(request, "🗑️ Offline session deleted successfully!")
    return redirect("offline-session")



############################################### Membership Plan Management ###########################################

@admin_login_required
def add_new_plan(request):
    if request.method == "POST":
        membership_type = request.POST.get("membership_type")
        amount = request.POST.get("amount")
        duration = request.POST.get("duration")
        offer = request.POST.get("offer")

        MembershipPlan.objects.create(
            membership_type=membership_type,
            amount=amount,
            duration=duration,
            offer=offer,
        )

        messages.success(request, "New Membership Plan has been created successfully!")
        return redirect("add-new-plan")  # reload same page

    return render(request, "app/add-new-plan.html")

# fetch all plans 

@admin_login_required
def view_plan(request):
    plans = MembershipPlan.objects.all().order_by('id')
    return render(request, "app/view-plan.html" , {"plans": plans })

@admin_login_required
def edit_plan(request, plan_id):
    plan = get_object_or_404(MembershipPlan, id=plan_id)

    if request.method == "POST":
        plan.membership_type = request.POST.get("membership_type")
        plan.amount = request.POST.get("amount")
        plan.duration = request.POST.get("duration")
        plan.offer = request.POST.get("offer")
        plan.save()

        messages.success(request, "Membership Plan updated successfully!")
        return redirect("view-plan")

    return render(request, "app/update-plan.html", {"plan": plan})


@admin_login_required
def delete_plan(request, plan_id):
    plan = get_object_or_404(MembershipPlan, id=plan_id)
    plan.delete()
    messages.success(request, "Membership Plan deleted Successfully!")
    return redirect("view-plan")




############################################# Renevals Management ###########################################


@admin_login_required
def renewals(request):
    today = now().date()
    current_month_start = today.replace(day=1)
    next_month_start = (current_month_start + timedelta(days=32)).replace(day=1)

    # All Members
    all_members = Member.objects.all()

    # Expiring this month (sirf future expiry jo current month me hai)
    expiring_this_month = Member.objects.filter(
        expiry_date__gte=today,  # ✅ aaj se aage hi consider karo
        expiry_date__lt=next_month_start
    )

    # Expired Members
    expired_members = Member.objects.filter(expiry_date__lt=today)

    # Status assign karna
    def get_status(member):
        if member.expiry_date < today:
            return "Expired"
        elif member.expiry_date.month == today.month and member.expiry_date.year == today.year:
            return "Expiring Soon"
        else:
            return "Active"

    # Data ke sath status add karna (dob + photo bhi add kiya)
    def serialize_member(m):
        return {
            "id": m.id,
            "name": f"{m.first_name} {m.last_name}",
            "email": m.email,
            "contact": m.contact,
            "dob": m.dob,
            "photo": m.photo.url if m.photo else None,
            "membership_type": m.membership_type,
            "amount_paid": m.amount_paid,
            "due_amount": m.due_amount,
            "joining_date": m.joining_date,
            "expiry_date": m.expiry_date,
            "status": get_status(m)
        }

    all_members_with_status = [serialize_member(m) for m in all_members]
    expiring_with_status = [serialize_member(m) for m in expiring_this_month]
    expired_with_status = [serialize_member(m) for m in expired_members]

    context = {
        "all_members": all_members_with_status,
        "expiring_this_month": expiring_with_status,
        "expired_members": expired_with_status,
    }

    return render(request, "app/renewals.html", context)



@admin_login_required
def renew_plan(request, member_id):
    member = get_object_or_404(Member, id=member_id)

    if request.method == "POST":
        membership_type = request.POST.get("membership_type")
        amount_paid = request.POST.get("amount_paid")
        due_amount = request.POST.get("due_amount")
        new_expiry = request.POST.get("expiry_date")

        # ✅ Update member details
        member.membership_type = membership_type
        member.amount_paid = amount_paid
        member.due_amount = due_amount
        member.expiry_date = new_expiry
        member.save()

        messages.success(request, f"{member.first_name} {member.last_name}'s plan has been renewed successfully!")
        return redirect("renewals")

    context = {
        "member": member
    }
    return render(request, "app/renew-plan.html", context)



############################################### Membership Report Management ###########################################


@admin_login_required
def membership_report(request):
    today = now().date()
    current_month_start = today.replace(day=1)
    current_month_end = (current_month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

    # 1) Total Members
    total_members = Member.objects.count()

    # 2) Current Month me expiring
    expiring_this_month = Member.objects.filter(
        expiry_date__range=[current_month_start, current_month_end]
    ).count()

    # 3) Expired Members (expiry < today)
    expired_members = Member.objects.filter(expiry_date__lt=today).count()

    # 4) Active Members (expiry >= today)
    active_members = Member.objects.filter(expiry_date__gte=today).count()

    context = {
        "total_members": total_members,
        "expiring_this_month": expiring_this_month,
        "expired_members": expired_members,
        "active_members": active_members,
    }
    return render(request, "app/membership-report.html", context)




@admin_login_required
def membership_report_analysis(request):
    # Get selected month from GET
    selected_month = request.GET.get("month")
    today = date.today()

    # Default to current month if not selected
    if not selected_month:
        selected_month = today.strftime("%Y-%m")

    members = []
    total_revenue = 0
    total_members = 0

    try:
        # Parse year and month
        year, month = map(int, selected_month.split('-'))
        first_day = date(year, month, 1)
        last_day = date(year, month, calendar.monthrange(year, month)[1])

        # Fetch members from database
        members = Member.objects.filter(joining_date__range=[first_day, last_day])
        total_revenue = sum(m.amount_paid for m in members)
        total_members = members.count()

    except Exception as e:
        print("Error fetching members:", e)
        members = []
        total_revenue = 0
        total_members = 0

    context = {
        "members": members,
        "total_revenue": total_revenue,
        "total_members": total_members,
        "selected_month": selected_month,
    }
    return render(request, "app/membership-report.html", context)





################################################# Revenue Report Functions ##############################################

@admin_login_required
def revenue_report(request):
    # Total Revenue
    total_revenue = Member.objects.aggregate(total=Sum('amount_paid'))['total'] or 0

    today = date.today()

    # Monthly Recurring Revenue
    monthly_members = Member.objects.filter(
        expiry_date__year=today.year,
        expiry_date__month=today.month
    )
    monthly_recurring_revenue = monthly_members.aggregate(total=Sum('amount_paid'))['total'] or 0

    # New Members (joined this month)
    new_members_count = Member.objects.filter(
        joining_date__year=today.year,
        joining_date__month=today.month
    ).count()

    # ARPU
    total_members_count = Member.objects.count()
    arpu = (total_revenue / total_members_count) if total_members_count else 0

    # 👉 Debugging ke liye print
    print("DEBUG Revenue Report ===>")
    print("Total Revenue:", total_revenue)
    print("Monthly Recurring Revenue:", monthly_recurring_revenue)
    print("New Members This Month:", new_members_count)
    print("Total Members:", total_members_count)
    print("ARPU:", arpu)

    context = {
        'total_revenue': total_revenue,
        'monthly_recurring_revenue': monthly_recurring_revenue,
        'new_members_count': new_members_count,
        'arpu': arpu,
    }
    return render(request, "app/revenue-report.html", context)



@admin_login_required
def generate_detailed_report(request):
    report_data = []
    total_revenue = 0

    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')

    if from_date and to_date:
        try:
            from_date_obj = datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.strptime(to_date, "%Y-%m-%d").date()

            # Filter members by joining date within the selected range
            members = Member.objects.filter(joining_date__gte=from_date_obj,
                                            joining_date__lte=to_date_obj)
            
            # Prepare report data
            for member in members:
                report_data.append({
                    'id': member.id,
                    'first_name': member.first_name,
                    'last_name': member.last_name,
                    'membership_type': member.membership_type,
                    'total_amount': member.amount_paid,
                    'date': member.joining_date
                })

            total_revenue = members.aggregate(total=Sum('amount_paid'))['total'] or 0

        except Exception as e:
            print("Error parsing dates:", e)

    context = {
        'report_data': report_data,
        'total_revenue': total_revenue,
        'from_date': from_date,
        'to_date': to_date,
    }
    return render(request, "app/revenue-report.html", context)



    ##################################################### Logo Management #############################################



@admin_login_required
def logo_settings(request):
    if request.method == "POST":
        small_logo = request.FILES.get("small_logo")
        large_logo = request.FILES.get("large_logo")

        if small_logo or large_logo:
            # Save new logo
            Logos.objects.create(
                small_logo=small_logo,
                large_logo=large_logo
            )

        return redirect('logo-settings')

    # Get the latest added logo
    logos = Logos.objects.order_by('-updated_at').first()

    return render(request, "app/logo.html", {'logos': logos})



################################################### Atendendance Management #########################################

@admin_login_required
def staff_attendendence(request):       
    staffs = Staff.objects.filter(active=True)
    staff_table = []
    report = False
    present_count = 0
    absent_count = 0
    selected_staff = None
    all_staff_summary = None

    today = date.today()

    if request.method == "POST":
        action = request.POST.get("action")

        # 1. Mark Attendance
        if action == "mark_attendance":
            staff_id = request.POST.get("staff")
            att_date = request.POST.get("date")
            status = request.POST.get("status")

            if staff_id and att_date:
                staff = Staff.objects.get(id=staff_id)
                StaffAttendance.objects.update_or_create(
                    staff=staff,
                    date=att_date,
                    defaults={'present': True if status == "present" else False}
                )

        # 2. Generate Report (Single Staff)
        elif action == "generate_report":
            staff_id = request.POST.get("staff")
            from_date = request.POST.get("from_date")
            to_date = request.POST.get("to_date")

            if staff_id and from_date and to_date:
                selected_staff = Staff.objects.get(id=staff_id)
                from_date = datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date = datetime.strptime(to_date, "%Y-%m-%d").date()

                days = [from_date + timedelta(days=i) for i in range((to_date - from_date).days + 1)]
                attendance_qs = StaffAttendance.objects.filter(staff=selected_staff, date__range=[from_date, to_date])
                attendance_data = {att.date: att.present for att in attendance_qs}

                for day in days:
                    status = "No Record"
                    if day in attendance_data:
                        status = "Present" if attendance_data[day] else "Absent"
                        if status == "Present":
                            present_count += 1
                        else:
                            absent_count += 1
                    staff_table.append({"date": day, "status": status})

                report = True

        # 3. Show All Staff Current Month
        elif action == "show_all_current_month":
            year, month = today.year, today.month
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = date(year, month + 1, 1) - timedelta(days=1)

            all_staff_summary = []
            for staff in staffs:
                attendance_qs = StaffAttendance.objects.filter(staff=staff, date__range=[start_date, end_date])
                present_days = attendance_qs.filter(present=True).count()
                absent_days = attendance_qs.filter(present=False).count()
                all_staff_summary.append({
                    "staff_name": f"{staff.first_name} {staff.last_name}",
                    "present": present_days,
                    "absent": absent_days
                })

    return render(request, "app/attendance.html", {
        "staffs": staffs,
        "staff_table": staff_table,
        "selected_staff": selected_staff,
        "report": report,
        "present_count": present_count,
        "absent_count": absent_count,
        "all_staff_summary": all_staff_summary,
        "today": today,
    })


################################################### Trainer Management ###################################################

@admin_login_required
def trainer_profile(request):
    trainers = Staff.objects.filter(job_post__icontains='Trainer', active=True)    
    return render(request, "app/trainer-profile.html", {"trainers": trainers})



@admin_login_required
def trainer_profile_details(request, trainer_id):
    trainer = get_object_or_404(Staff, id=trainer_id, job_post__icontains='Trainer')

    #  Attendance Performance 
    total_days = StaffAttendance.objects.filter(staff=trainer).count()
    present_days = StaffAttendance.objects.filter(staff=trainer, present=True).count()
    performance = round((present_days / total_days) * 100, 2) if total_days > 0 else 0

    #  Sessions 
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())   # Monday
    week_end = week_start + timedelta(days=6)              # Sunday

    live_sessions = LiveSession.objects.filter(
        trainer_name__icontains=f"{trainer.first_name} {trainer.last_name}",
        session_datetime__date__range=(week_start, week_end)
    )
    offline_sessions = OfflineSession.objects.filter(
        trainer__icontains=f"{trainer.first_name} {trainer.last_name}",
        date_time__date__range=(week_start, week_end)
    )
    total_sessions = live_sessions.count() + offline_sessions.count()

    #  Salary (example - 500₹ per session * total sessions this week)
    salary = total_sessions * 500  

    #  Schedule (Live + Offline combine)
    schedule = list(live_sessions) + list(offline_sessions)

    context = {
        "trainer": trainer,
        "performance": performance,
        "present_days": present_days,
        "total_days": total_days,
        "live_sessions": live_sessions,
        "offline_sessions": offline_sessions,
        "total_sessions": total_sessions,
        "salary": salary,
        "schedule": schedule,
    }
    return render(request, "app/trainer.html", context)


################################################### Equipement Management###################################################


@admin_login_required
def add_equipment(request):
    if request.method == "POST":
        form = EquipmentForm(request.POST, request.FILES)  
        if form.is_valid():
            form.save()
            messages.success(request, "✅ Equipment added successfully!")  # Success message
            return redirect('add-equipment')  
    else:
        form = EquipmentForm()
    return render(request, 'app/equipment.html', {'form': form})


@admin_login_required
def show_equipment(request):
    all_equipment = Equipment.objects.all()
    maintenance_equipment = Equipment.objects.filter(status="Under Maintenance")
    expired_equipment = Equipment.objects.filter(maintenance_date__lt=now().date())

    context = {
        "all_equipment": all_equipment,
        "maintenance_equipment": maintenance_equipment,
        "expired_equipment": expired_equipment,
    }
    return render(request, "app/show-equipment.html", context)



@admin_login_required
def update_equipment(request, pk):
    equipment = get_object_or_404(Equipment, pk=pk)  # id ke hisab se data fetch
    
    if request.method == "POST":
        form = EquipmentForm(request.POST, request.FILES, instance=equipment)
        if form.is_valid():
            form.save()
            messages.success(request, "✅ Equipment updated successfully!")
            return redirect('show-equipment')  # update hone ke baad list page par bhej do
    else:
        form = EquipmentForm(instance=equipment)

    return render(request, "app/update-equipment.html", {"form": form, "equipment": equipment})

@admin_login_required
def equipment_detail(request, id):
    equipment = get_object_or_404(Equipment, id=id)
    return render(request, 'app/equipment-detail.html', {'equipment': equipment})


@admin_login_required
def delete_equipment(request, id):
    equipment = get_object_or_404(Equipment, id=id)
    equipment.delete()
    return redirect('show-equipment')

#################################################### Supplement Management ###############################################
@admin_login_required
def add_new_supplement(request):
    if request.method == "POST":
        customer_name = request.POST.get("customer_name")
        contact_no = request.POST.get("contact_no")
        email = request.POST.get("email")
        city = request.POST.get("city")
        adhar_number = request.POST.get("adhar_number")
        product_name = request.POST.get("product_name")
        product_quantity = request.POST.get("product_quantity")
        product_price = request.POST.get("product_price")
        product_company_name = request.POST.get("product_company_name")
        sale_date = request.POST.get("sale_date")
        product_expiry_date = request.POST.get("product_expiry_date")

        try:
            ProteinsSale.objects.create(
                customer_name=customer_name,
                contact_no=contact_no,
                email=email,
                city=city,
                adhar_number=adhar_number,
                product_name=product_name,
                product_quantity=product_quantity,
                product_price=product_price,
                product_company_name=product_company_name,
                sale_date=sale_date,
                product_expiry_date=product_expiry_date
            )
            messages.success(
                request,
                f"✅ {customer_name} ne {product_name} ka record save kiya!"
            )
        except Exception as e:
            messages.error(request, f"❌ Error: {e}")

        return redirect("add-supplement")  # same page reload

    # Yaha se table ke liye data bhejna hai
    sales = ProteinsSale.objects.all().order_by("-created_at")
    return render(request, "app/proteins-sale.html", {"sales": sales})


@admin_login_required
def delete_supplement(request, sale_id):
    try:
        sale = ProteinsSale.objects.get(id=sale_id)
        sale.delete()
        messages.success(request, f"🗑️ {sale.customer_name} ka record delete ho gaya.")
    except ProteinsSale.DoesNotExist:
        messages.error(request, "❌ Record Not Available.")
    return redirect("add-supplement")


############################################## Settings Management ########################################

from django.contrib.auth.hashers import make_password

@admin_login_required
def settings_page(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")

        if UserAccount.objects.filter(email=email).exists():
            messages.error(request, "❌ Email already exists!")
        else:
            UserAccount.objects.create(
                username=username,
                email=email,
                password=make_password(password)  # hashed dd
            )
            messages.success(request, "✅ Admin created successfully!")

        return redirect("settings")

    # GET request → all admins
    admins = UserAccount.objects.all()
    return render(request, "app/settings.html", {"admins": admins})
    
    
    



@admin_login_required
def delete_admin(request, admin_id):
    admin = get_object_or_404(UserAccount, id=admin_id)
    admin.delete()
    messages.success(request, "✅ Admin deleted successfully!")
    return redirect("settings")


