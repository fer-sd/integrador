/*
Clase UIElementSet - Integrador
*/

function uiElementSet(){

	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
        
    // Array con los uiElements instanciados
    var uiElements = [];

	/***** Métodos privados ******/

	/**
	* Método para extraer un uiElement pasado como parámetro
	* @param id: id del uiElement que se desea obtener (proveedor-servicio)
	* @return: si existe, devuelve el uiElement. Si no, devuelve false
	*/
	function getUiElement(id){
		for (c=0 ; c<uiElements.length; c++){
            if (uiElements[c].getId() == id)
            	return uiElements[c];
        }
		return false;
	}

	/**
	* Método para insertar un uiElement (objeto) pasado como parámetro en el uiElementSet
    * @param object: objeto asociado al uiElement instanciado
	*/
	function setUiElement(object){
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
    function delUiElement(id){
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
	function uiElementSetSize(){
		return uiElements.length;
	}


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


	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

}

//Constructor
var integrador = new uiElementSet();

