// Prefill email title with SKU
function prefillEmailTitle() {
  const urlParams = new URLSearchParams(window.location.search);
  const sku = urlParams.get('sku');
  const isSample = urlParams.get('sample') === 'true';
  
  if (sku) {
    const emailTitleField = document.getElementById('email-title');
    if (emailTitleField) {
      if (isSample) {
        emailTitleField.value = `Free Sample Request for ${sku}`;
      } else {
        emailTitleField.value = `Quote request for ${sku}`;
      }
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', prefillEmailTitle);
} else {
  prefillEmailTitle();
}

