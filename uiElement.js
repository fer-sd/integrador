/*
Clase UIElement - Integrador
*/

//Versión uiElement.js
var uiElementVersion = 1.32;

function uiElement(object){ 
	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
	//Propietario del elemento 
	var owner = object.getOwner().toLowerCase();
	//Servicio del propietario sobre el que se va a actuar
	var service = object.getService().toLowerCase();
	//ID elemento 
	var id = owner+'-'+service;
	//Estado actual
	var currentStatus = object.getStatus();
	//Array de posibles estados
	var status= object.getStatusSet(); 
	//Nombre del objeto original
	var objectName = "";

	//Array de reglas asociadas al uiElement
	//var rules = [];

	//Array de acciones seleccionadas
	var actions = [];
	
	//Array de posibles estados propios. "on" -> suscrito. "off"->no suscrito. "error" -> se produjo algún error en la suscripción
	var internalStatus= ["on","off","error"];
	//Estado interno actual. Por defecto desactivado. Cambia según resultado de la suscripción. Depende de internalStatus[]
	var currentInternalStatus = "off";

	/***** Métodos privados ******/

	/**
    * Función con las acciones asociadas a cada estado de la instancia del uiElement en el DOM  
    * El integrador debe pasar esta función como parámetro al realizar la suscripción al uiElement          
    * @param currentStatus: String con el estado actual de la instancia del elemento externo
    * @param instance: instancia en el DOM de la clase del uiElement al que se está suscrito
    */
	var actionsFunction = function(currentStatus, instance){
		try{
			//Recùperamos id del uiElement
			var myId = instance.getOwner()+"-"+instance.getService();
			//Recuperamos el uiElement pasando su id
			var myUiElement	= integrador.getUiElement(myId);
			//Array de funciones a ejecutar
			var myActions = myUiElement.getActions();

			//Ejecutar array de funciones
			for (var i=1; i<myActions.length; i++)
	   			myActions[i];
			//Cambio de estado del uiElement
		    console.log("Estado antes: "+myUiElement.getCurrentStatus());
		    myUiElement.setCurrentStatus(currentStatus);
		    console.log("Estado después: "+myUiElement.getCurrentStatus());
		}
		catch (e){console.log(e)}	
	}

	
	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

	this.getId = function(){
		return id;
	}
	this.setId = function(){
		//se concatena propietario y servicio
		id = this.owner.toLowerCase()+'-'+this.service.toLowerCase();
	}
	this.getOwner = function(){
		return owner;
	}
	this.setOwner = function(owner){
		owner = this.owner;
	}
	this.getService = function(){
		return service;
	}
	this.setService = function(service){
		service = this.service;
	}
	this.getStatus = function(){
		return status;
	}
	this.setStatus = function(status){
		status = this.status;
	}
	this.getObjectName = function(){
		return objectName;
	}
	this.setObjectName = function(object){
		objectName = object;
	}
	this.getCurrentStatus = function(){
		return currentStatus;
	}
	this.setCurrentStatus = function(myStatus){
		//Hay que usar myStatus (no this.myStatus) para que se evalue correctamente
		currentStatus = myStatus;
		//Reevaluar reglas
	}
	this.getCurrentInternalStatus = function(){
		return currentInternalStatus;
	}
	this.setCurrentInternalStatus = function(myStatus){
		currentInternalStatus = myStatus;
	}
	this.setActions = function(myActions){
		actions = myActions;
	}	
	this.getActions = function(){
		return actions;
	}
	this.getActionsFunction = function(){
		return actionsFunction;
	}
	this.getRules = function(){
		return rules;
	}
	this.addRule = function(rule){
		rules.push(rule);
	}
};
