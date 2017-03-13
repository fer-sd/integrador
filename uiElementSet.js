/*
Clase UIElementSet - Integrador
*/

//Versión uiElementSet.js
var uiElementSetVersion = 1.32;

function uiElementSet(){

	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
        
    //Array con los uiElements instanciados
    var uiElements = [];

    //Array de acciones
	var actionSet = [];

	//Rellenamos el array (esta acción se debe incluir en un método aparte). 
	//La idea es sacar esta operación fuera del uiElementSet
	actionSet[0]="if (csi_status == myStatus[0]) console.log('Encuesta creada - Version encuesta CSI: '+instance.getVersion());";
	actionSet[1]="if (csi_status == myStatus[1]) {console.log('Modal encuesta lanzado - Version encuesta CSI: '+instance.getVersion());$('.usabilla_live_button_container').css('display','none');console.log('Moquillo encuesta Usabilla cerrado por Integrador');setTimeout(function(){instance.cerrarModalEncuesta();console.log('Modal encuesta cerrado por Integrador');}, 3000);}";
	actionSet[2]="if (csi_status == myStatus[2]) {console.log('Modal encuesta cerrado - Version encuesta CSI: '+instance.getVersion());}";
	actionSet[3]="if (csi_status == myStatus[3]) {console.log('Modal inicial lanzado - Version encuesta CSI: '+instance.getVersion());setTimeout(function(){instance.cerrarModalInicial();console.log('Modal inicial cerrado por Integrador');}, 3000);}";
	actionSet[4]="if (csi_status == myStatus[4]) {console.log('Modal inicial cerrado - Version encuesta CSI: '+instance.getVersion());}";
	actionSet[5]="if (csi_status == myStatus[5]) {console.log('Modal minimizado lanzado - Version encuesta CSI: '+instance.getVersion());}";
	actionSet[6]="if (csi_status == myStatus[6]) {console.log('Modal minimizado cerrado - Version encuesta CSI: '+instance.getVersion());}";

	/***** Métodos privados ******/

	/**
	* Método que asocia un id de uiElement con un set de funciones a ejecutar en cada estado
	* @param id: id del uiElement que se desea obtener (proveedor-servicio)
 	* @return: functionsArray. Array con las funciones a ejecutar por el uiElement
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
					return false;
			}
		}
		catch (e){console.log(e)}
	}

	/**
	* Inserta acciones seleccionadas en el array de acciones del uiElement
	* @param selectedActions: Array con las posiciones de las acciones seleccionadas en el actionSet[]
 	* @return myActionsArray: Array con las funciones seleccionadas
	*/
	var actionsArrayGenerator = function(selectedActions){
		var myActionsArray = [];
			for (c=0 ; c<selectedActions.length; c++)
				myActionsArray.push(actionSet[c]);
	    return myActionsArray;
	}	


	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

	/**
	* Constructor de uiElements en base al objeto pasado como parámetro
    * @param object: String con el objeto asociado al uiElement instanciado
 	* @return: si se realiza correctamente la operación, devuelve true, en caso contrario, false
	*/
	this.setUiElement = function(object){
		try{
			var myObject = window[object];

	    	if ((typeof(myObject)!=null) || (typeof(myObject)!=undefined)){
	    		/* Inicio constructor del uiElement */
		    	//Instanciación del uiElement
		    	var myUiElement = new uiElement(myObject);
		    	//Asignación de nombre de objeto original
		    	myUiElement.setObjectName(object);
		    	//Añadir reglas

		    	//Asignar acciones
		    	myUiElement.setActions(actionsSwitcher(myUiElement.getId()));
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
				//console.log(uiElements[c].getId());
	            if (uiElements[c].getId() == id)
	            	return uiElements[c];
	        }
			return false;
		}
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
	    	//recuperamos el array de acciones asociadas al uiElement
	    	var myActions = myUiElement.getActionsFunction();
	    	console.log("FUNCIÓN DE ACCIONES: "+ myActions);
	    	
			//Comprueba que el objeto existe yla función de suscripción existe en la clase asociada al objeto
	        if (typeof(eval(mySuscriptionFunction))=="function"){
		       var mySuscriptionToken = mySuscriptionFunction+'('+myActions+')';
		       //Ejecuta la suscripción pasando como parámetro la función de acciones
		       eval(mySuscriptionToken);
		       //Si se ha suscrito correctamente, cambiamos estado interno del uiElement a "on"
		       myUiElement.setCurrentInternalStatus("on");
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
}

//Constructor
var integrador = new uiElementSet();

