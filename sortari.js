
window.addEventListener("load", function () {

    // FILTRARI
    document.getElementById("filtrare").onclick = function () {
        var produse = document.querySelectorAll("article");
        var pretMin = document.getElementById("i_range").value;
        var cu_disponibilitate = document.getElementById("i_bool1").checked;
        var fara_disponibilitate = document.getElementById("i_bool2").checked;
        var nume_input = document.getElementById("i_text").value;
        var categorie_input = document.getElementsByName("gr_rad");
        var descriere_input = document.getElementById("i_textarea").value;
        var material_input = document.getElementById("i_sel_simplu").value;
        var optiuni = document.getElementById("i_sel_multiplu").options;

        sir_categorii="";
        for (let ctg of categorie_input){
            if (ctg.checked){
                sir_categorii = ctg.value;
                break;
            }
        }

        var lista = [];
		for(let opt of optiuni){
			if(opt.selected)
				lista.push(opt.value);
        }

        for (var prod of produse) {
            prod.style.display = "block";
            var nume_produs = prod.getElementsByClassName("nume")[0];
            var pret = prod.getElementsByClassName("pret")[0].textContent; //am scris fara parseInt
            var disponibilitate = prod.getElementsByClassName("disponibilitate")[0];
            

            console.log(nume_produs);
            console.log(pret);

            /*Conditia pentru campul de text, adica numele produsului*/
            var nume = prod.getElementsByClassName("nume")[0];
            var conditie1 = 1;
            if (nume_input != "") {
                conditie1 = (nume.innerHTML.trim().toLowerCase().includes(nume_input.trim().toLowerCase()));
            }

            /*Conditia pentru pret, range ul*/
            var conditie2 = (parseInt(pret) <= parseInt(pretMin));
            console.log(conditie2);

            /*Conditia pentru radiobuttons adica categoriile*/
            var categorie = prod.getElementsByClassName("categorie")[0];
            var conditie3 = (sir_categorii == categorie.innerHTML || sir_categorii=="nimic");

            /*Conditia pentru campul boolean, daca e in stoc sau nu*/
            var conditie4cu = (cu_disponibilitate && disponibilitate.innerHTML == 1);
            var conditie4fara = (fara_disponibilitate && disponibilitate.innerHTML == 0);

            /*Conditia pentru textarea, adica descrierea produsului*/
            var descriere = prod.getElementsByClassName("descriere")[0];
            var conditie5 = 1;
            if (descriere_input != "") {
                conditie5 = (descriere.innerText.trim().toLowerCase().includes(descriere_input.toLowerCase()));
            }

            /*Conditia selectul simplu*/
            var material = prod.getElementsByClassName("material")[0];
            var conditie6 = ((material_input.trim() == material.innerHTML.trim()) || (material_input=="nimic"));
            console.log(material_input + " " + material);

             /*Conditia selectul multiplu*/
            var culoare = prod.getElementsByClassName("culori")[0];
            var culori_split = culoare.innerHTML.trim().split(", ");
            var conditie7 = false;
            for(elem of lista){
                if(culori_split.includes(elem)) {
                     conditie7 = true;
                    }
            }
            
            /*Conditia finala care cuprinde toate conditiile*/
            var conditie_finala = conditie1 && conditie2 && conditie3 && (conditie4cu || conditie4fara) && conditie5 && conditie6 && conditie7;
            console.log(conditie_finala);

            if (conditie_finala == false) {
                prod.style.display = "none";
            }
        }
    }



    document.getElementById("i_range").onchange = function () {
        document.getElementById("info_range").innerHTML = this.value;
    }


    //SORTARI
    //SORTARE CRESCATOARE
    document.getElementById("sort_asc").onclick = function(){
        var container = document.getElementById("gr-produse");
        var categorie = container.children;
        console.log(categorie);

        var categorii_array = Array.from(categorie)
        console.log(categorii_array);
        console.log(document.getElementsByClassName("categorie")[0].textContent);
        categorii_array.sort(function(a,b){
            if(a.getElementsByClassName("categorie")[0].textContent.localeCompare(b.getElementsByClassName("categorie")[0].textContent) == - 1 ){
                console.log("primul if")
                return -1;
            }
            if(a.getElementsByClassName("categorie")[0].textContent.localeCompare(b.getElementsByClassName("categorie")[0].textContent) == 1 ){
                console.log("al doilea if")
                return 1;
            }
            else{
                
                var a_pret = a.getElementsByClassName("pret")[0].textContent
                var b_pret = b.getElementsByClassName("pret")[0].textContent
                console.log("COMPARARE:a="+a_pret)
                console.log("COMPARARE:b="+b_pret)
                return a_pret - b_pret
            }
        })

        for(var i = 0; i < categorii_array.length; i++){
            let aux = categorii_array[i]
            console.log(aux)
            container.appendChild(aux)
        }
    }

    //SORTARE DESCRESCATOARE
    document.getElementById("sort_desc").onclick = function(){
        var container = document.getElementById("gr-produse");
        var categorie = container.children;
        console.log(categorie);

        var categorii_array = Array.from(categorie)
        console.log(categorii_array);
        console.log(document.getElementsByClassName("categorie")[0].textContent);
        categorii_array.sort(function(a,b){
            if(a.getElementsByClassName("categorie")[0].textContent.localeCompare(b.getElementsByClassName("categorie")[0].textContent) == 1 ){
                console.log("primul if")
                return -1;
            }
            if(a.getElementsByClassName("categorie")[0].textContent.localeCompare(b.getElementsByClassName("categorie")[0].textContent) == -1 ){
                console.log("al doilea if")
                return 1;
            }
            else{
                
                var a_pret = a.getElementsByClassName("pret")[0].textContent
                var b_pret = b.getElementsByClassName("pret")[0].textContent
                console.log("COMPARARE:a="+a_pret)
                console.log("COMPARARE:b="+b_pret)
                return b_pret - a_pret
            }
        })

        for(var i = 0; i < categorii_array.length; i++){
            let aux = categorii_array[i]
            console.log(aux)
            container.appendChild(aux)
        }
    }
    

    // CALCULARE  
    document.getElementById("avg").onclick = function(){
        var avg = 0
        var count = 0

        var container = document.getElementById("gr-produse")
        var preturi = container.children
        console.log(preturi)
        var preturi_array = []

        for(var pret of preturi){
            console.log(pret)
            if(pret.style.display != "none"){
                preturi_array[count] = pret
                count = count + 1
                var pret_curent = pret.getElementsByClassName("pret")[0].textContent
                avg = avg + Number(pret_curent)
            }
        }

        if(count > 0){
            avg = Number(avg/count)
            alert( "Media prețurilor produselor din magazinul nostru este "+ Math.round(avg * 100) / 100 + " RON")
        }
        else{
            alert( "Eroare!")
        }
    }


    //RESETARE FILTRE
    document.getElementById("resetare").onclick = function(){
        document.getElementById("i_text").value = "";
        document.getElementById("i_range").value = "1000";
        document.getElementById("i_rad").checked = true;
        document.getElementById("i_textarea").value = "";
        document.getElementById("i_sel_simplu").value = "nimic";
        document.getElementById("i_check1").checked = true;
        document.getElementById("i_check2").checked = true;
        
        var options = document.getElementById("i_sel_multiplu").options
        for (var opt of options){
            opt.selected = true;
        }
    }
})