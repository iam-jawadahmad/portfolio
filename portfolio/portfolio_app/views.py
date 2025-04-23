from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .forms import ContactForm

# Create your views here.

def home(request):
    form = ContactForm()
    return render(request, 'index.html' ,{'form':form})

def portfolio_details(request):
    return render(request, 'portfolio-details.html')

def services_details(request):
    return render(request, 'service-details.html')

@require_POST
def submit_form(request):
    # Initialize the form with the POST data
    form = ContactForm(request.POST)

    # Check if the form is valid (includes captcha validation)
    if form.is_valid():
        # Get the form data
        name = form.cleaned_data['name']
        email = form.cleaned_data['email']
        subject = form.cleaned_data['subject']
        message = form.cleaned_data['message']

        # Here you can handle the data, e.g., send email, save to DB etc.
        print(f"Contact from {name} <{email}> - {subject}: {message}")

        # Respond with success
        return JsonResponse({'status': 'OK'})

    else:
        # Return errors in JSON if form is not valid
        errors = form.errors.as_json()
        return JsonResponse({'status': 'ERROR', 'errors': errors})
