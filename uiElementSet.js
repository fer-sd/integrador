/**
* @fileoverview UIElementSet - Integrador
*
* @author POA Development Team
* @version 1.35
*/

function uiElementSet(){

	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
        
    //Array con los uiElements instanciados
    var uiElements = [];

    //Array de acciones
	var actionSet = [];

	//Rellenamos el array (esta acción se debe incluir en un método aparte). 
	//La idea es sacar esta operación fuera del uiElementSet
	actionSet[0]="if (currentStatus == myStatus[0]) console.log('Encuesta creada - Version encuesta CSI: '+instance.getVersion());";
	actionSet[1]="if (currentStatus == myStatus[1]) {console.log('Modal encuesta lanzado - Version encuesta CSI: '+instance.getVersion());$('.usabilla_live_button_container').css('display','none');console.log('Moquillo encuesta Usabilla cerrado por Integrador');setTimeout(function(){instance.cerrarModalEncuesta();console.log('Modal encuesta cerrado por Integrador');}, 3000);}";
	actionSet[2]="if (currentStatus == myStatus[2]) {console.log('Modal encuesta cerrado - Version encuesta CSI: '+instance.getVersion());}";
	actionSet[3]="if (currentStatus == myStatus[3]) {console.log('Modal inicial lanzado - Version encuesta CSI: '+instance.getVersion());setTimeout(function(){instance.cerrarModalInicial();console.log('Modal inicial cerrado por Integrador');}, 3000);}";
	actionSet[4]="if (currentStatus == myStatus[4]) {console.log('Modal inicial cerrado - Version encuesta CSI: '+instance.getVersion());}";
	actionSet[5]="if (currentStatus == myStatus[5]) {console.log('Modal minimizado lanzado - Version encuesta CSI: '+instance.getVersion());}";
	actionSet[6]="if (currentStatus == myStatus[6]) {console.log('Modal minimizado cerrado - Version encuesta CSI: '+instance.getVersion());}";

	/***** Métodos privados ******/

	/**
	* Método que asocia un id de uiElement con un set de funciones a ejecutar en cada estado
	* @param id {String} id del uiElement que se desea obtener (proveedor-servicio)
 	* @return: functionsArray {Object}. Array de funciones a ejecutar por el uiElement
	*/
	var actionsSwitcher = function(id){
		try{
			switch (id){
				case "csi-encuesta":
					//Llamaos a generador de array de acciones con las posiciones de las acciones seleccionadas
					return actionsArrayGenerator([0,1,2,3,4,5,6]);	
					break;
				/**
				case "inbenta-chat":
					return actionsArrayGenerator([]);
					break;
				case "tealium-login":
					return actionsArrayGenerator([]);
					break;
				case:
					break;
				**/
				default:
					//Comportamiento por defecto
			}
		}
		catch (e){console.log(e)}
	}

	/**
	* Inserta acciones seleccionadas en el array de acciones del uiElement
	* @param selectedActions {Object} Array que contiene las posiciones de las acciones seleccionadas en el array actionSet[]
 	* @return myActionsArray {Object} Array con las funciones seleccionadas
	*/
	var actionsArrayGenerator = function(selectedActions){
		var myActionsArray = [];
			for (c=0 ; c<selectedActions.length; c++)
				myActionsArray.push(actionSet[c]);
	    return myActionsArray;
	}	

	/**
    * Método que invoca a la función suscripción del integrador al uiElement            
    * @param suscriptionFunction {String} Cadena con la llamada explícita a la función de suscripción
 	* @return {boolean} Si se realiza correctamente la operación, devuelve true, en caso contrario, false
    */
    var suscriptionRequest = function(suscriptionFunction){
    	try{	    	
	       //Ejecuta la suscripción pasando como parámetro la función de acciones
	       //Evitamos uso de eval()
	       var tmpFunc = new Function(suscriptionFunction);
			tmpFunc();
	       return true;
		}
	    catch (e){
	    	console.log(e);
	    	return false;
	    }	
	}


	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

	/**
	* Constructor de uiElements en base al nombre de la instancia del elemento pasado como parámetro
    * @param instanceName {String} Cadena con el nombre de la instancia asociada al uiElement instanciado
 	* @return {boolean} Si se realiza correctamente la operación, devuelve true, en caso contrario, false
	*/
	this.setUiElement = function(instanceName){
		try{
			//Instanciamos el elemento en base al nombre pasado como parámetro
			var myInstance = window[instanceName];

			//Se comprueba que la instancia es correcta
	    	if ((typeof(myInstance)!=null) || (typeof(myInstance)!=undefined)){
	    		/* Inicio constructor del uiElement */
		    	//Creaciónn del uiElement
		    	var myUiElement = new uiElement(myInstance);
		    	//Asignación de nombre de la instancia del elemento original
		    	myUiElement.setInstanceName(instanceName);
		    	//Añadir reglas

		    	//Asignar acciones
		    	myUiElement.setActions(actionsSwitcher(myUiElement.getId()));
				 //Añadir elemento al set
				uiElements.push(myUiElement);
				return true;
	    	}
	    	else{
				//Depuración
		        console.log('Ocurrió un error en la creación del uiElement ' + instanceName);
		        return false;
	    	} 
	    }
	    catch (e){
	    	console.log(e);
	    	return false;
	    }
	}

	/**
	* Método que controla el flujo de suscripción del Integrador a un uiElement
    * @param id {String} Cadena con la id del uiElement al que se quiere suscribir Integrador
    * @param suscriptionFunction {String} Cadena con el nombre de la función de suscripción
 	* @return {boolean} Si se realiza correctamente la operación, devuelve true, en caso contrario, false
	*/
	this.setSuscription = function(id,suscriptionFunction){
		try{
			//recuperamos uiElement asociado a la id recibida
    		var myUiElement = this.getUiElement(id);
    		//recuperamos nombre de la instancia del elemento asociado al uiElement
    		var myInstanceName = myUiElement.getInstanceName();
    		//creamos token con la función de suscripción (instancia.metodo())	
	    	var mySuscriptionFunction = myInstanceName+'.'+suscriptionFunction;
	    	//recuperamos las acciones seleccionadas asociadas al uiElement
	    	var myActions = myUiElement.getActionsFunction();

	    	//Comprueba que la instancia existe y la función de suscripción existe en la clase asociada a dicha instancia
	 		//Comprueba que la función de acciones es una función
	        if (typeof(eval(myActions))=="function" && typeof(eval(mySuscriptionFunction))=="function"){
	        	//Creamos token de llamada a la suscripción
		        var mySuscriptionToken = mySuscriptionFunction+'('+myActions+')';
		        //Ejecutamos la llamada
		        if (suscriptionRequest(mySuscriptionToken)){
		        	//Si la suscripción se realiza correctamente, cambiamos estado del uiElemento a "on"
		        	myUiElement.setCurrentInternalStatus("on");
		        	return true;
		        }
		        else{ 
		        	//Depuración
		        	console.log('Ocurrió un error en la suscripción al elemento ' + id);
		        	return false;
		        }
		    }
		    else{		        	
		    		//Depuración
		        	console.log('Error de validación de tipos de dato del elemento ' + id);
		        	return false;

		    }
	    }
	    catch (e){
	    	console.log(e);
	    	return false;
	    }
	}

	/**
	* Método para extraer un uiElement pasado como parámetro
	* @param id {String} Cadena con el nombre del id del uiElement que se desea obtener (proveedor-servicio)
	* @return {boolean} Si existe, devuelve el uiElement. Si no existe o hay algún error, devuelve false
	*/
	this.getUiElement = function(id){
		try{
			for (c=0 ; c<uiElements.length; c++){
				//console.log(uiElements[c].getId());
	            if (uiElements[c].getId() == id)
	            	return uiElements[c];
	        }
			return false;
		}
		catch (e){
			console.log(e);
			return false;
		}	
	}

	/**
	Método para eliminar un uiElement identificado por su id pasada como parámetro
	* @param id {String} Cadena con el nombre del id del uiElement que se desea eliminar (proveedor-servicio)
	* @return {boolean} Si existe, elimina el uiElement. Si no existe o hay algún error, devuelve false
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
		catch (e){
			console.log(e);
			return false;
		}
    }

	/**
	* Devuelve el número de uiElements que contiene el uiElementSet
 	* @return {Integer} Número de uiElements que contiene actualmente el uiElementSet
	*/
	this.getUiElementSetSize = function(){
		return uiElements.length;
	}
}

//Constructor
var integrador = new uiElementSet();

