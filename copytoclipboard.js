function copy() {
  var copyText = document.getElementById("URL");
  copyText.select();
  document.execCommand("copy");
  alert("URL successfully copied to your clipboard!");
}
