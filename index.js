const express = require('express') // import modulul express
var path = require('path');

var mysql = require('mysql');
const session = require('express-session');
const formidable = require('formidable'); //permite sa luam si fisierele spre deosebire de bodyParser
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const SendmailTransport = require('nodemailer/lib/sendmail-transport');
var fs = require('fs');
const { response } = require('express');
var rimraf = require("rimraf"); //pt a sterge folderul cu poze

//aici am creat serverul
var app = express();

//setam o sesiune pentru useri

app.use(session({
    secret: 'abcdefg', //folosit de express session pt criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
}));

//setez folderele statice (cele in care nu am fisiere generate prin node)

app.use('/resources', express.static('resurse'));
app.use('/poze_uploadate', express.static('poze_uploadate'));

//conexiune la mysql cand porneste serverul - setari
var connection = mysql.createConnection({
    host: "localhost",
    user: "UserIpets",
    password: "1q2w3eSASHA!",
    database: "ipets"
});

//aici cream de fapt conexiunea - todo list dupa ce se conecteaza prin callback function
connection.connect(function(err) {
    if (err) throw err;
    console.log("Ne-am conectat la baza de date!");
});


//functii utile

function getUtiliz(req) {
    var utiliz;
    if (req.session) {
        utiliz = req.session.utilizator
    } else { utiliz = null }
    return utiliz;
}




//setez drept compilator de template-uri ejs (setez limbajul in care vor fi scrise template-urile)
app.set('view engine', 'ejs');

console.log(__dirname); //predefinita - calea pe masina serverului
console.log(path.join(__dirname, "resources"));
app.use(express.static(path.join(__dirname, "resources")));

// aici astept cereri de forma localhost:8080 (fara nimic dupa)
app.get('/', function(req, res) {
    res.render('pages/index', { utilizator: req.session.utilizator }); //afisez index-ul in acest caz
});


//funnctie pentru a trimite emailuri asincrona
async function trimiteMail(username, email) {
    var transp = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth: {
            user: "irinastefanescu1999@gmail.com",
            pass: "#tDhGVQ8#g#@"
        },
        tls: {
            rejectUnauthorized: false //nu fac autorizari pt cereri neautorizate
        }
    });
    await transp.sendMail({ //await pt ca e asincrona
        from: "irinastefanescu1999@gmail.com",
        to: email,
        subject: "Cont nou",
        text: "Bine ai venit în comunitatea IPETS! Username-ul tău este " + username,
        html: "<h1>Salut,</h1><p>Bine ai venit în comunitatea IPETS!</p><p>Username-ul tău este " + "<b style='color: green;'>" + username + "</b>" + "</p>"
    });
    console.log("Mail-ul a fost trimis!");
}

//functie trimiteMailStergere in cazul in care se sterge un utilizator
async function trimiteMailStergere(username, email) {
    var transp = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth: {
            user: "irinastefanescu1999@gmail.com",
            pass: "#tDhGVQ8#g#@"
        },
        tls: {
            rejectUnauthorized: false //nu fac autorizari pt cereri neautorizate
        }
    });
    await transp.sendMail({ //await pt ca e asincrona
        from: "irinastefanescu1999@gmail.com",
        to: email,
        subject: "Stergere cont",
        text: "Cu sinceră părere de rău, vă anunțăm că ați fost șters! Adio...",
        html: "<h1>Salut,</h1><p>Cu sinceră părere de rău, vă anunțăm ca ați fost șters! Adio...</p>"
    });
    console.log("Mail-ul a fost trimis!");
}

//formular useri
var parolaServer = "tehniciWeb";
app.post("/inreg", function(req, resp) {
    var formular = formidable.IncomingForm();
    console.log("Am intrat pe post!");
    formular.parse(req, function(eroare, campuriText, campuriFisier) {
        var eroare = "";
        console.log(campuriText);

        //verificari campuri inainte de comanda + sa nu fie campuri necompletate
        if (campuriText.username == "")
            eroare += "Username nesetat!";
        if (campuriText.nume == "")
            eroare += "Nume nesetat!";
        if (campuriText.prenume == "")
            eroare += "Prenume nesetat!";
        if (campuriText.email == "")
            eroare += "Email nesetat!";
        if (campuriText.username == "")
            eroare += "Parolă nesetată!";

        //sql injection

        if (eroare == "") {
            unescapedUsername = campuriText.username;
            unescapedEmail = campuriText.email;
            campuriText.username = mysql.escape(campuriText.username)
            campuriText.nume = mysql.escape(campuriText.nume)
            campuriText.prenume = mysql.escape(campuriText.prenume)
            campuriText.email = mysql.escape(campuriText.email)
            campuriText.ocupatie = mysql.escape(campuriText.ocupatie)
            var parolaCriptata = mysql.escape(crypto.scryptSync(campuriText.parola, parolaServer, 32).toString("ascii")); //criptare parole cu scryptSync sa nu mai folosim atatea functii callback

            //verificare daca userul exista deja sau nu
            var preluare = `select id from utilizatori where username=${campuriText.username}`;
            connection.query(preluare, function(err, rez, campuri) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                if (rez.length != 0) {
                    eroare += "Username-ul există deja!";
                    resp.render("pages/inregistrare_user", { err: eroare, raspuns: "Completați corect formularul!" });
                } else {

                    //fac copie pt calea de la folderul cu pozele uploadate
                    var copie_username = campuriText.username;

                    for (let usrname = 0; usrname < campuriText.username.length; usrname++) {
                        if (copie_username == campuriText.username[usrname]) {
                            response.render("pages/inregistrare_user");
                        }
                    }

                    var copie_email = campuriText.email;

                    var comanda = `insert into utilizatori (username, nume, prenume, email, ocupatie, parola, cale_imagine) values(${campuriText.username},${campuriText.nume}, ${campuriText.prenume},${campuriText.email}, ${campuriText.ocupatie}, ${parolaCriptata}, '${"/resources/poze_uploadate/" + unescapedUsername + "/" + campuriFisier.cale_imagine.name}') `;
                    console.log(comanda);
                    connection.query(comanda, function(err, rez, campuri) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        trimiteMail(unescapedUsername, unescapedEmail);
                        resp.render("pages/inregistrare_user", { err: "", raspuns: "Date introduse!", utilizator: req.session.utilizator });
                    });
                }


            });
        } else {
            resp.render("pages/inregistrare_user", { err: eroare, raspuns: "Completați corect formularul!" })
        }
    });

    //nr ordine: 1
    formular.on("field", function(name, field) {
        if (name == 'username')
            username = field;
        console.log("camp - field:", name)
    });

    //nr ordine: 2
    formular.on("fileBegin", function(name, campFisier) {
        console.log("inceput upload: ", campFisier);
        if (campFisier && campFisier.name != "") {
            //am  fisier transmis
            var cale = __dirname + "/resources/poze_uploadate/" + username
            if (!fs.existsSync(cale))
                fs.mkdirSync(cale);
            campFisier.path = cale + "/" + campFisier.name;
            console.log(campFisier.path);
        }
    });

    //nr ordine: 3
    formular.on("file", function(name, field) {
        console.log("final upload: ", name);
    });

});



//-------------------------------- logare si delogare utilizator ---------------------------------------


app.post("/login", function(req, res) {
    var formular = formidable.IncomingForm()
    console.log("am intrat pe login");

    formular.parse(req, function(err, campuriText, campuriFisier) { //se executa dupa ce a fost primit formularul si parsat
        var parolaCriptata = mysql.escape(crypto.scryptSync(campuriText.parola, parolaServer, 32).toString("ascii"));
        campuriText.username = mysql.escape(campuriText.username)
        var comanda = `select username, nume, prenume, email, data_inregistrare, ocupatie, rol, cale_imagine from utilizatori where username=${campuriText.username} and parola=${parolaCriptata}`;
        connection.query(comanda, function(err, rez, campuri) {
            console.log(comanda);
            if (rez && rez.length == 1) {
                req.session.utilizator = {
                    username: campuriText.username,
                    nume: rez[0].nume,
                    prenume: rez[0].prenume,
                    email: rez[0].email,
                    data_inregistrare: rez[0].data_inregistrare,
                    ocupatie: rez[0].ocupatie,
                    rol: rez[0].rol,
                    cale_imagine: rez[0].cale_imagine
                }
                res.render("pages/index", { utilizator: req.session.utilizator });
            } else {
                res.render("pages/index");
            }
        });
    });
});

app.get('/logout', function(req, res) {
    console.log("logout");
    req.session.destroy();
    res.render("pages/index");
});


//-------------------------------- actiunile admin-ului: afisare si stergere utilizator ---------------------------------------

//-------------------afisare--------------------------
app.get('/useri', function(req, res) {

    if (req.session && req.session.utilizator && req.session.utilizator.rol == "admin") {
        connection.query("select * from utilizatori", function(err, rezultat, campuri) {
            if (err) throw err;
            //console.log(rezultat);
            res.render('pages/useri', { useri: rezultat, utilizator: getUtiliz(req) }); //afisez index-ul in acest caz
        });
    } else {
        res.render('pages/eroare', { mesaj: "Nu aveti acces", utilizator: req.session.utilizator });
    }

});

//-------------------stergere--------------------------
app.post("/sterge_utiliz", function(req, res) {

    if (req.session && req.session.utilizator && req.session.utilizator.rol == "admin") {
        var formular = formidable.IncomingForm()
        console.log("Sterge utilizator");
        formular.parse(req, function(err, campuriText, campuriFisier) {
            var select = `select username, email from utilizatori where id='${campuriText.id}'`;

            connection.query(select, function(err, rez, campuri) {
                trimiteMailStergere(rez[0].username, rez[0].email);
                var cale = __dirname + "/resources/poze_uploadate/" + rez[0].username;
                fs.rmdir(cale, { recursive: true }, function() { console.log("Am sters si folderul utilizatorului cu poze!"); });

                console.log(cale);
                var comanda = `delete from utilizatori where id='${campuriText.id}'`;

                connection.query(comanda, function(err, rez, campuri) {
                    console.log("Am sters un utilizator");
                });
            });

        });
    }
    res.redirect("/useri");


});

app.get('/desprenoi', function(req, res) {
    res.render('pages/desprenoi', { utilizator: req.session.utilizator }); //afisez desprenoi.html/ejs in acest caz
});


//query este asincron - poate dura si 2/3 min si nu vrem sa blocam executia
app.get('/produse', function(req, res) {
    connection.query("select * from produse", function(err, result, campuri) {
        if (err) throw err;
        console.log(result);
        res.render('pages/produse', {
            produse: result,
            utilizator: req.session.utilizator
        });
    });
});

app.get('/produs/:id', function(req, res) {
    var idProdus = req.params.id;

    connection.query("select * from produse where id=" + idProdus, function(err, rezultat, campuri) {
        if (err) throw err;
        console.log(rezultat);
        res.render('pages/pag_produs', {
            produs_unic: rezultat[0],
            utilizator: req.session.utilizator
        }); //afisez index-ul in acest caz
    });

});

//---------------------------------- MODEL SUBIECT EXAMEN -----------------------------
app.get('/elevi', function(req, res) {

    connection.query("select * from elevi", function(err, rezultat, campuri) {
        if (err) throw err;
        //console.log(rezultat);
        res.render('pages/elevi', { elevi: rezultat }); //afisez index-ul in acest caz
    });

});

async function trimiteMailNumar(numar_mailuri, email) {
    var transp = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth: {
            user: "irinastefanescu1999@gmail.com",
            pass: "#tDhGVQ8#g#@"
        },
        tls: {
            rejectUnauthorized: false //nu fac autorizari pt cereri neautorizate
        }
    });
    var data_curenta = new Date();
    await transp.sendMail({ //await pt ca e asincrona
        from: "irinastefanescu1999@gmail.com",
        to: email,
        subject: "Model Examen",
        text: "Număr mail: " + numar_mailuri + "Ora " + data_curenta.getHours() + ":" + data_curenta.getMinutes() + ":" + data_curenta.getSeconds(),
        html: "<p style=\"color: green\"> Număr mail: " + numar_mailuri + " Ora " + data_curenta.getHours() + ":" + data_curenta.getMinutes() + ":" + data_curenta.getSeconds() + "</p>"
    });
    console.log("Mail-ul a fost trimis!");
}

app.post("/trimiteMail", function(req, res) {
    var formular = formidable.IncomingForm();

    if (!req.session.numar_mailuri)
        req.session.numar_mailuri = 1;
    else
        req.session.numar_mailuri++;

    formular.parse(req, function(err, campuriText, campuriFisier) { //se executa dupa ce a fost primit formularul si parsat
        var email = campuriText.email;

        trimiteMailNumar(req.session.numar_mailuri, email);
        res.redirect('/elevi');
    });
});
//-----------------------------------------------------------------------------


//cerere serviciu
app.get('/ora_server', function(req, res) {
    res.setHeader("Content-Type", "text/html");
    var d = new Date();
    //res.write(d+""); conversie implicita la sir
    res.write(d.getFullYear() + "/" + d.getMonth());
    res.write("</body></html>");
    res.end();
});



//aici astept orice tip de cerere (caracterul special * care tine loc de orice sir)
app.get('/*', function(req, res) {

    res.render('pages/' + req.url, function(err, rezRandare) {
        if (err) { //intra doar cand avem eroare
            if (err.message.includes("Failed to lookup view"))
                res.status(404).render('pages/404');
            else
                throw err;
        } else {
            //console.log(rezRandare);
            res.send(rezRandare);
        }
    }); //afisez pagina ceruta dupa localhost:8080
    //de exemplu pentru localhost:8080/pag2 va afisa fisierul /pag2 din folderul pagini
    console.log(req.url); //afisez in consola url-ul pentru verificare
});

app.listen(8080); //serverul asculta pe portul 8080
console.log("A pornit serverul pe portul 8080");