from django.shortcuts import redirect

def admin_login_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.session.get('user_id'):
            return redirect('login')  # agar login nahi hai to login page bhej do
        return view_func(request, *args, **kwargs)
    return wrapper






