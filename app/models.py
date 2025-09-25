from django.db import models
from django.utils import timezone 
from datetime import date, timedelta


class UserAccount(models.Model):
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    contact = models.CharField(max_length=15, blank=True, null=True, unique=True)
    address = models.TextField(blank=True, null=True)
    experience = models.TextField(blank=True, null=True)  # or IntegerField if only years
    about = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    education = models.TextField(blank=True, null=True)
    certification = models.TextField(blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=128)
    agreed_terms = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    assigned_pages = models.JSONField(default=list, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)  

    def __str__(self):
        return self.username
   

class Member(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=20)
    email = models.EmailField(max_length=50)
    contact = models.CharField(max_length=15)
    gender = models.CharField(max_length=10)
    dob = models.DateField()
    address = models.CharField(max_length=150)  # spelling fixed
    city = models.CharField(max_length=30)
    pincode = models.CharField(max_length=20)
    photo = models.ImageField(upload_to='members_photos/', blank=True, null=True)
    membership_type = models.CharField(max_length=40)
    amount_paid = models.DecimalField(max_digits=20, decimal_places=2)
    due_amount = models.DecimalField(max_digits=20, decimal_places=2)  # spelling fixed
    joining_date = models.DateField()
    expiry_date = models.DateField()

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.membership_type}"
    
    @property
    def status(self):
        today = date.today()
        if self.expiry_date < today:
            return "Expired"
        elif self.expiry_date - today <= timedelta(days=3):
            return "Expiring Soon"
        return "Active"
    


class Staff(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    contact = models.CharField(max_length=15, unique=True)
    gender = models.CharField(max_length=10)   # Simple text field
    joining_date = models.DateField()
    job_post = models.CharField(max_length=100)    
    dob = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to='staff_photos/', blank=True, null=True)
    aadhar_number = models.CharField(max_length=12, unique=True)
    pincode = models.CharField(max_length=6)

    # Extra fields
    active = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.job_post}"
    

class StaffSalary(models.Model):
    staff_id = models.CharField(max_length=20)
    staff_name = models.CharField(max_length=100)
    job_role = models.CharField(max_length=100)
    account_number = models.CharField(max_length=30)
    bank_name = models.CharField(max_length=100)
    salary_amount = models.DecimalField(max_digits=10, decimal_places=2)
    salary_date = models.DateField()
    salary_mode = models.CharField(max_length=20, choices=[
        ('Cash', 'Cash'),
        ('Bank Transfer', 'Bank Transfer'),
        ('UPI', 'UPI'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.staff_name} - {self.salary_amount}"
    


# Staff Salary Invoice Model
class StaffInvoice(models.Model):
    staff_name = models.CharField(max_length=100)
    staff_id = models.CharField(max_length=50, unique=True)
    job_role = models.CharField(max_length=100, null=True, blank=True)
    account_number = models.CharField(max_length=18)
    bank_name = models.CharField(max_length=100)
    salary_amount = models.DecimalField(max_digits=10, decimal_places=2)
    salary_date = models.DateField()
    payment_mode = models.CharField(max_length=50)  # 👈 कोई choices नहीं
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.staff_name} ({self.staff_id})"


class StaffAttendance(models.Model):
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    present = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.staff.first_name} {self.staff.last_name} - {self.date} ({'Present' if self.present else 'Absent'})"


# Member Bill Invoice Model
class MemberInvoice(models.Model):
    member_name = models.CharField(max_length=100)
    member_id = models.CharField(max_length=50, unique=True)
    membership_type = models.CharField(max_length=50)  # 👈 कोई choices नहीं
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    billing_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.member_name} ({self.member_id})"
    


class LiveSession(models.Model):
    session_title = models.CharField(max_length=200)
    trainer_name = models.CharField(max_length=100)
    session_datetime = models.DateTimeField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    participants = models.PositiveIntegerField()
    session_link = models.URLField()
    note = models.TextField(blank=True, null=True)  # optional field

    # Automatic timestamps
    created_at = models.DateTimeField(auto_now_add=True)  # set when record is created
    updated_at = models.DateTimeField(auto_now=True)      # updated whenever record changes

    def __str__(self):
        return f"{self.session_title} - {self.trainer_name}"
    


class OfflineSession(models.Model):
    session_name = models.CharField(max_length=255)
    trainer = models.CharField(max_length=255)
    date_time = models.DateTimeField()
    location = models.CharField(max_length=255)
    participants = models.PositiveIntegerField()
    duration_minutes = models.PositiveIntegerField()
    notes = models.TextField(blank=True, null=True)  # optional

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.session_name} - {self.trainer}"
    

class MembershipPlan(models.Model):
    MEMBERSHIP_CHOICES = [
        ('1', '1 Month'),
        ('2', '2 Months'),
        ('3', '3 Months'),
        ('6', '6 Months'),
        ('12', '1 Year'),
        ('24', '2 Years'),
    ]

    membership_type = models.CharField(
        max_length=10,
        choices=MEMBERSHIP_CHOICES
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=50)
    offer = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)   # new record create time
    updated_at = models.DateTimeField(auto_now=True)       # record update time

    def __str__(self):
        return f"{self.get_membership_type_display()} - ₹{self.amount}"



class Logos(models.Model):
    small_logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    large_logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Logos (ID: {self.id})"
    

class SupplementSale(models.Model):
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    price_per_item = models.DecimalField(max_digits=10, decimal_places=2)
    sale_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product_name} - {self.quantity} pcs"

    @property
    def total_price(self):
        return self.quantity * self.price_per_item
    
class Equipment(models.Model):
    equipment_name = models.CharField(max_length=100)   # Equipment Name
    category = models.CharField(max_length=50)          # Category
    brand = models.CharField(max_length=100)            # Brand
    purchase_date = models.DateField()                  # Purchase Date
    status = models.CharField(max_length=50)            # Status
    location = models.CharField(max_length=100)         # Location
    maintenance_date = models.DateField(null=True, blank=True)  # Maintenance Date
    image = models.ImageField(upload_to="equipment_images/", null=True, blank=True)  # Equipment Image
     

    
    def is_maintenance_expired(self):
        from datetime import date
        return self.maintenance_date and self.maintenance_date < date.today()
    

class ProteinsSale(models.Model):
    product_name = models.CharField(max_length=255)
    product_quantity = models.PositiveIntegerField()
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    product_company_name = models.CharField(max_length=255)
    sale_date = models.DateField()
    product_expiry_date = models.DateField()
    customer_name = models.CharField(max_length=255)
    contact_no = models.CharField(max_length=15)
    email = models.EmailField()
    city = models.CharField(max_length=100)
    adhar_number = models.CharField(max_length=12, unique=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True)     

    def __str__(self):
        return f"{self.customer_name} - {self.product_name}"


