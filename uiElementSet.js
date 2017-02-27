/*
Clase UIElementSet - Integrador
*/


function uiElementSet(){

	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
        
    // id del elementSet instanciado
    var uiElementSetId = "9";
    // Array con la referenca a los uiElements Instanciados
    var uiElementsCont = [];

	/***** Métodos privados ******/

	/**
    * Método que debe invocar cualquier elemento que quiera interactuar             
    * @param object: String con el nombre del objeto asociado al uiElement instanciado
    * @param suscriptionFunction: String con el nombre de la función de suscripción
    * @param actionsFunction: Función con el comportamiento/acciones del elemento al que se suscribe
    */
    function suscriptionRequest(object,suscriptionFunction,actionsFunction){
	
	var mySuscriptionFunction = object+'.'+suscriptionFunction;
		//Comprueba que la función de suscripción existe en la clase asociada al objeto
	       if ((typeof(eval(mySuscriptionFunction))=="function")){
		       var mySuscriptionToken = object+'.'+suscriptionFunction+'('+actionsFunction+')';
		       //Ejecuta la suscripción pasando como parámetro la función de acciones
		       eval(mySuscriptionToken);
		}
		else{
		//Registrar errores
		}	
	}
					
    // Añade un uiElement al uiElementSet
    function addUiElement(data){
		//definición del elemento que se va a añadir
       uiElementsCont.push(data);
    }
    
    // elimina un uiElement del uiElementSet
    function delUiElementSet(id){
        uiElementsCont.slide(id,parseInt(id)+1);
    }
    
    // Devuelve el númerio de uiElements Instanciados
    function uiElementSetCount(){
        return uiElementsCont.length;
    }

    function init(){
                           
     }

	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/
	
	/**
	* Método que debe ejecutar el proveedor para avisar al integrador que se acaba de instanciar
	* Lo guarda en el array de uiElements
    * @param object: String nombre del objeto asociado al uiElement instanciado
    * @param suscriptionFunction: String con el nombre de la función de suscripción
    * @param actionFunctions: Array con los nombres de las funciónes a ejecutar
    */
	this.loadUiElement = function(object,suscriptionFunction,actionsFunction){
		//Instancia objeto en base al nombre pasado como parámetro
		var myObject = window[object];
		 //Comprueba que el objeto existe en el DOM
		 if ((typeof(myObject)!=null) || (typeof(myObject)!=undefined)){
			  //Añadir elemento al set
			  addUiElement(myObject);
		  }
		 suscriptionRequest(object,suscriptionFunction,actionsFunction);
	}
			
    // Método que rescata todos los uiElements almacenados
    this.getAllUiElements = function(){
       //return uiElementsCont.length + " - " + uiElementsCont;
       return uiElementsCont;
    }
            
    // Método que recupera cada uno de los uiElements almacenados
    this.getEachUiElements = function(){
       for ( c=0 ; c<uiElementsCont.length; c++){
            console.log(uiElementsCont[c].proveedor + " - " + uiElementsCont[c].servicio + " - " +  uiElementsCont[c].estado);
        }
    }
}

//Constructor
var integrador = new uiElementSet();

