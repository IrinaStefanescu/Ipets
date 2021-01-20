window.onload = function() {
    var numar_sortari_vechi = localStorage.getItem("numar_sortari") ? parseInt(localStorage.getItem("numar_sortari")) : 0; //la inceput nu va exista;
    var numar_filtrari_vechi = localStorage.getItem("numar_filtrari") ? parseInt(localStorage.getItem("numar_filtrari")) : 0; //la inceput nu va exista;

    document.getElementById("statistici").innerHTML = "Număr sortări: " + numar_sortari_vechi + " Număr filtrări: " + numar_filtrari_vechi;
    document.getElementById("reseteazaLocalStorage").onclick = function() {
        localStorage.clear();
    }

    document.getElementById("sorteaza").onclick = function() {
        var numar_sortari_vechi = localStorage.getItem("numar_sortari") ? parseInt(localStorage.getItem("numar_sortari")) : 0; //la inceput nu va exista;
        localStorage.setItem("numar_sortari", numar_sortari_vechi + 1);

        var sel = document.getElementById("ordine").value; //folosim selectul

        //children sau getElementsByTagName() sa seletez articolul
        var grid = document.getElementById("grid-elevi");
        //var articole = grid.children;
        var articole = grid.getElementsByTagName("article"); //doar articolele din gridul nostru, d asta nu punem document
        //returneaza o colectie getElemtsByTagName si trebuie sa convertim la array
        var vector_articole = Array.from(articole);
        vector_articole.sort(function(a, b) {
            //cu classname daca avem mai multe ul-uri sau tagname daca e un singur ul, nu avem voie sa punem id uri in for!!!!!
            var ul_note = a.getElementsByClassName("note")[0]; //[0] pt ca iau doar din a, e unul singur
            //querySelectorAll("note") <- merge si asa; li_note e o colectie de note
            var li_note = ul_note.getElementsByTagName("li"); //aici nu punem [0]pt ca vrem toate notele, nu doar pe prima
            var suma_a = 0;
            for (var i = 0; i < li_note.length; i++) {
                suma_a += parseInt(li_note[i].innerHTML); //nu uitam sa convertim stringul la int; merge si cu Number()
            }
            var medie_a = suma_a / li_note.length;

            //cu classname daca avem mai multe ul-uri sau tagname daca e un singur ul, nu avem voie sa punem id uri in for!!!!!
            ul_note = b.getElementsByClassName("note")[0]; //[0] pt ca iau doar din a, e unul singur
            //querySelectorAll("note") <- merge si asa; li_note e o colectie de note
            li_note = ul_note.getElementsByTagName("li"); //aici nu punem [0]pt ca vrem toate notele, nu doar pe prima
            var suma_b = 0;
            for (var i = 0; i < li_note.length; i++) {
                suma_b += parseInt(li_note[i].innerHTML); //nu uitam sa convertim stringul la int; merge si cu Number()
            }
            var medie_b = suma_b / li_note.length;

            if (sel == "asc")
                return medie_a - medie_b;
            else
                return medie_b - medie_a;
        });
        //tre sa afisam sortarea si in pagina
        for (var i = 0; i < vector_articole.length; i++) {
            //adaugam la parintele articolelor adica in divul cu idul grid-elevi
            grid.appendChild(vector_articole[i]);
        }
    }

    document.getElementById("filtreaza").onclick = function() {
        var numar_filtrari_vechi = localStorage.getItem("numar_filtrari") ? parseInt(localStorage.getItem("numar_filtrari")) : 0; //la inceput nu va exista;
        localStorage.setItem("numar_filtrari", numar_filtrari_vechi + 1);

        var nume_cautat = document.getElementById("nume_elev").value;

        var grid = document.getElementById("grid-elevi");
        var articole = grid.getElementsByTagName("article");
        for (var i = 0; i < articole.length; i++) {
            articole[i].style.display = "block";

            var nume = articole[i].getElementsByClassName("nume")[0].innerHTML;
            if (!nume.includes(nume_cautat)) {
                articole[i].style.display = "none";
            }
        }
    }
}