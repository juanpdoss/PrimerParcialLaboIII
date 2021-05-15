window.addEventListener("load",cargarPersonas);

function $(id) {
    return document.getElementById(id);
  }


function cargarPersonas()
{
    var tabla=$("tabla");
    var peticion=new XMLHttpRequest();  
    peticion.open("GET","http://localhost:3000/materias",true);
    peticion.send();
    $("divSpinner").hidden=false;

    peticion.onreadystatechange=function()
    {

        if(peticion.status== 200 && peticion.readyState == 4)
        {
            $("divSpinner").hidden=true;
            var arrayJson=JSON.parse(peticion.responseText);
            //console.log(arrayJson);
    
            for (let index = 0; index < arrayJson.length; index++) 
            {
                crearFila(arrayJson[index],tabla);
            }

        }

    }

}


function crearFila(persona,tabla)
{
    //id, nombre, cuatrimestre, fechaFinal y turno.

    var id=persona.id;
    var nombre=persona.nombre;
    var cuatrimestre=persona.cuatrimestre;
    var fecha=persona.fechaFinal;
    var turno=persona.turno;

    var nuevaFila=document.createElement("tr");

    var tdId=document.createElement("td");
    var tdNombre=document.createElement("td");
    var tdCuatrimestre=document.createElement("td");
    var tdFecha=document.createElement("td");
    var tdTurno=document.createElement("td");
    
    var textoId=document.createTextNode(id);
    var textoNombre=document.createTextNode(nombre);
    var textoCuatrimestre=document.createTextNode(cuatrimestre);
    var textoTurno=document.createTextNode(turno);
    var textoFecha=document.createTextNode(fecha);
    
    tdId.appendChild(textoId);
    tdNombre.appendChild(textoNombre);
    tdCuatrimestre.appendChild(textoCuatrimestre);
    tdFecha.appendChild(textoFecha);
    tdTurno.appendChild(textoTurno);

    tdId.style="display:none;";
    nuevaFila.appendChild(tdNombre);
    nuevaFila.appendChild(tdCuatrimestre);
    nuevaFila.appendChild(tdFecha);
    nuevaFila.appendChild(tdTurno);
    nuevaFila.appendChild(tdId);


    nuevaFila.addEventListener("dblclick",desplegarFila);

    tabla.appendChild(nuevaFila);
}



function desplegarFila(e)
{
    $("divPersona").hidden=false;
  
    var tabla=$("tabla");

    var fila=e.target.parentNode; //obtengo fila
    var nombre=fila.childNodes[0].childNodes[0].nodeValue;
    var cuatrimestre=fila.childNodes[1].childNodes[0].nodeValue;
    var fecha=fila.childNodes[2].childNodes[0].nodeValue;
    var turno=fila.childNodes[3].childNodes[0].nodeValue;
    var id=fila.childNodes[4].childNodes[0].nodeValue;


    $("txtNombre").value=nombre;
    $("cboCuatrimestre").selectedIndex=cuatrimestre-1;
    $("cboCuatrimestre").disabled=true;

    var aux=fecha.split("/");

    $("txtFecha").value=aux[2]+"-"+aux[1]+"-"+aux[0]; //debe existir algo menos rebuscado - googlear
   
    
    if(turno == "Mañana")
    {
        $("Mañana").checked=true;
    }
    else
    {
        $("Noche").checked=true;
    }


    $("btnModificar").onclick=function()
    {
       
        let flagNombre=true;     
        let flagFecha=true;
        let flagTurno=true;
       
        if($("txtNombre").value.length <= 6)
        {     
            $("txtNombre").style.borderColor="red";          
            flagNombre=false;

        }

        if(!($("Mañana").checked || $("Noche").checked))
        {
            flagTurno=false;
        }
       
       
        var fechaInput=new Date($("txtFecha").value);
        //Mi chrome retorna la fecha con un formato horrible que tiene segundos y la localidad etc u_u 
        if(fechaInput < Date.now())
        {
            $("txtFecha").style.borderColor="red";
            flagFecha=false;
        }
     
        if(flagNombre && flagFecha && flagTurno)
        {
            var nombreInput= $("txtNombre").value;
            var cuatrimestreInput= $("cboCuatrimestre").value;
            var turno="Mañana";
            
        
            if($("Noche").cheked)
            {
                turno="Noche";
            }

          
            var jsonMateria={"nombre":nombreInput,"cuatrimestre":cuatrimestreInput,"fechaFinal":fechaInput,"turno":turno,"id":id}

            var peticion=new XMLHttpRequest();
            peticion.open("POST","http://localhost:3000/editar");
            peticion.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            peticion.send(JSON.stringify(jsonMateria));
            $("divSpinner").hidden=false;

            peticion.onreadystatechange= function() 
            {
                
                if(peticion.status == 200 && peticion.readyState == 4)
                {
                    $("divSpinner").hidden=true;                   
                    var respuesta=JSON.parse(peticion.responseText);

                    console.log(respuesta);
                    if(respuesta.type == 'ok')
                    {
                        fila.childNodes[0].childNodes[0].nodeValue=nombreInput;
                        fila.childNodes[1].childNodes[0].nodeValue=cuatrimestre;
                        fila.childNodes[2].childNodes[0].nodeValue=fechaInput;
                        fila.childNodes[3].childNodes[0].nodeValue=turno;
                        console.log("Modificacion realizada.");
                        $("divPersona").hidden=true;
                    }
                    
                }


            }
       
        }


    }

    $("btnEliminar").onclick=function()
    {
        var jsonMateria={"nombre":nombre,"cuatrimestre":cuatrimestre,"fechaFinal":fecha,"turno":turno,"id":id}
        var peticion=new XMLHttpRequest();
        peticion.open("POST","http://localhost:3000/eliminar");
        peticion.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        peticion.send(JSON.stringify(jsonMateria));
        $("divSpinner").hidden=false;

        peticion.onreadystatechange= function() 
        {                
            if(peticion.status == 200 && peticion.readyState == 4)
            {
                $("divSpinner").hidden=true;

                var respuesta=JSON.parse(peticion.responseText);
                if(respuesta.type== "ok")
                {
                    console.log("materia eliminada ok");
                    tabla.removeChild(fila);
                    $("divPersona").hidden=true;
                }

               
            }
        }
        
    }

}


