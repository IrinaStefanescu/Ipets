function validateForm() {
    var parola = document.getElementById("pass").value;
    var rparola = document.getElementById("rpass").value;
    var nume = document.getElementById("nume").value;
    var prenume = document.getElementById("prenume").value;

    var rez = (parola == rparola)
    if (rez == false) {
        alert("Parolele nu coincid!");
    }

    reznume = nume.match(new RegExp("^[A-z\s\-]+"));
    rezprenume = prenume.match(new RegExp("^[A-z\s\-]+"));

    if (reznume == false || rezprenume == false) {
        alert("Numele și prenumele nu corespund formatului cerut!");
    }

    return rez && reznume && rezprenume;
}