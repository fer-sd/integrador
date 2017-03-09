/*
Clase UIElementSet - Integrador
*/

//Versión uiElementSet.js
var uiElementSetVersion = 1.1;

function uiElementSet(){

	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
        
    // Array con los uiElements instanciados
    var uiElements = [];

    // Array con las posibles acciones
    var actions = [];    


	/***** Métodos privados ******/


	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

	/**
	* Método para insertar un uiElement (objeto) pasado como parámetro en el uiElementSet
    * @param object: String con el objeto asociado al uiElement instanciado
 	* @return: si se realiza correctamente la operación, devuelve true, en caso contrario, false
	*/
	this.setUiElement = function(object){
		try{
			var myObject = window[object];

	    	if ((typeof(myObject)!=null) || (typeof(myObject)!=undefined)){
		    	//Instanciación del uiElement
		    	var myUiElement = new uiElement(myObject);
		    	//Asignación de nombre de objeto original
		    	myUiElement.setObjectName(object);
				 //Añadir elemento al set
				uiElements.push(myUiElement);
				return true;
	    	}
	    	else return false;
	    }
	    catch (e){console.log(e)}
	}

	/**
	* Método para extraer un uiElement pasado como parámetro
	* @param id: id del uiElement que se desea obtener (proveedor-servicio)
	* @return: si existe, devuelve el uiElement. Si no, devuelve false
	*/
	this.getUiElement = function(id){
		try{
			for (c=0 ; c<uiElements.length; c++){
				console.log(uiElements[c].getId());
	            if (uiElements[c].getId() == id)
	            	return uiElements[c];
	        }
			return false;
		catch (e){console.log(e)}	
	}

	/**
    * Método que debe invocar cualquier elemento que quiera interactuar             
    * @param id: String con la id del uiElement al que se quiere suscribir Integrador
    * @param suscriptionFunction: String con el nombre de la función de suscripción
 	* @return: si se realiza correctamente la operación, devuelve true, en caso contrario, false
    */
    this.suscriptionRequest = function(id,suscriptionFunction){
    	try{
    		//recuperamos uiElement asociado a la id recibida
    		var myUiElement = this.getUiElement(id);
    		//recuperamos nombre del objeto asociado al uiElement
    		var myObjectName = myUiElement.getObjectName();
    		//creamos token con la función de suscripción (objeto.metodo())	
	    	var mySuscriptionFunction = myObjectName+'.'+suscriptionFunction;
	    	//recuperamos acciones asociadas al uiElement
	    	var myActionsFunction = myUiElement.getActions();
	    	
			//Comprueba que el objeto existe yla función de suscripción existe en la clase asociada al objeto
	        if (typeof(eval(mySuscriptionFunction))=="function"){
		       var mySuscriptionToken = mySuscriptionFunction+'('+myActionsFunction+')';
		       //Ejecuta la suscripción pasando como parámetro la función de acciones
		       eval(mySuscriptionToken);
		       return true;
			}
			else return false;
		}
	    catch (e){console.log(e)}	
	}

	/**
	Método para eliminar un uiElement (objeto) identificado por su id pasada como parámetro
	* @param id: id del uiElement que se desea eliminar
	* @return: si existe, devuelve True y elimina el uiElement. Si no se encuentra, devuelve false
	*/
    this.removeUiElement = function(id){
    	try{
	    	for (c=0 ; c<uiElements.length; c++){
	            if (uiElements[c].getId() == id){
	            	uiElements.splice(c, 1);
	            	return true;
	            }
	        }
			return false;
		}
		catch (e){console.log(e)}
    }

	/**
	* Devuelve el número de uiElements que contiene el uiElementSet
 	* @return: número de uiElements que contiene actualmente el uiElementSet
	*/
	this.getUiElementSetSize = function(){
		return uiElements.length;
	}

	/**
	* Añade una acción
	* @param: 
 	* @return: 
	*/
	this.addAction = function(action){
		actions.push(action);
	}

	/**
	* Devuelve una acción
	* @param 
 	* @return: 
	*/
	this.getAction = function(){
		//return actions[];
	}

	/**
	* Elimina una acción
	* @param id: id del uiElement que se desea eliminar
 	* @return: número de uiElements que contiene actualmente el uiElementSet
	*/
	this.removeAction = function(action){
		//remove action;
	}
}

//Constructor
var integrador = new uiElementSet();

