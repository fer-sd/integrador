/*
Clase UIElementSet - Integrador
*/

//Versión uiElementSet.js
var uiElementSetVersion = 1.0;

function uiElementSet(){

	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
        
    // Array con los uiElements instanciados
    var uiElements = [];

    //var rules = new rules();

	/***** Métodos privados ******/

	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

	/**
	* Método para extraer un uiElement pasado como parámetro
	* @param id: id del uiElement que se desea obtener (proveedor-servicio)
	* @return: si existe, devuelve el uiElement. Si no, devuelve false
	*/
	this.getUiElement = function(id){
		for (c=0 ; c<uiElements.length; c++){
			console.log(uiElements[c].getId());
            if (uiElements[c].getId() == id)
            	return uiElements[c];
        }
		return false;
	}

	/**
	* Método para insertar un uiElement (objeto) pasado como parámetro en el uiElementSet
    * @param object: objeto asociado al uiElement instanciado
	*/
	this.setUiElement = function(object){
		 //Comprueba que el objeto existe en el DOM
		 if ((typeof(object)!=null) || (typeof(object)!=undefined)){
			 //Añadir elemento al set
			uiElements.push(object);
			//Ejecutar suscripción
			//suscriptionRequest(object,suscriptionFunction,actionsFunction);
		}
	}

	/**
	Método para eliminar un uiElement (objeto) identificado por su id pasada como parámetro
	* @param id: id del uiElement que se desea eliminar
	* @return: si existe, devuelve True y elimina el uiElement. Si no se encuentra, devuelve false
	*/
    this.removeUiElement = function(id){
    	for (c=0 ; c<uiElements.length; c++){
            if (uiElements[c].getId() == id){
            	uiElements.splice(c, 1);
            	return true;
            }
        }
		return false;
    }

	/**
	Devuelve el número de uiElements que contiene el uiElementSet
	*/
	this.getUiElementSetSize = function(){
		return uiElements.length;
	}


	/**
    * Método que debe invocar cualquier elemento que quiera interactuar             
    * @param object: objeto asociado al uiElement instanciado
    * @param suscriptionFunction: String con el nombre de la función de suscripción
    */
    this.suscriptionRequest = function(object,suscriptionFunction){

    	var myObject = window[object];

    	if (typeof(myObject)=="object") {
	    	//Instanciación del uiElement
	    	var myUiElement = new uiElement(myObject);
	    	//Insertar el uiElement en el set
	    	this.setUiElement(myUiElement);
    	}
    	else return false;
    	
    	var mySuscriptionFunction = object+'.'+suscriptionFunction;
    	var myActionsFunction = myUiElement.getActions();
    	
		//Comprueba que el objeto existe yla función de suscripción existe en la clase asociada al objeto
        if (typeof(eval(mySuscriptionFunction))=="function"){
	       var mySuscriptionToken = object+'.'+suscriptionFunction+'('+myActionsFunction+')';
	       //Ejecuta la suscripción pasando como parámetro la función de acciones
	       eval(mySuscriptionToken);
	       return true;
		}
		else{
			return false;
		//Registrar errores
		}	
	}

}

//Constructor
var integrador = new uiElementSet();

