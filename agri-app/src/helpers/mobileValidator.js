export function mobileValidator(mobile) {
    if (!mobile) return "Mobile can't be empty."
    if (mobile.length < 10) return 'Please  enter a valid mobile number.';
    return ''
}
