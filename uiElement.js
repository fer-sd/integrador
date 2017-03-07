/*
Clase UIElement - Integrador
*/

//Versión uiElement.js
var uiElementVersion = 1.0;

function uiElement(object){ 
	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
	//Propietario del elemento 
	var owner = object.getOwner().toLowerCase();
	//Servicio del propietario sobre el que se va a actuar
	var service = object.getService().toLowerCase();
	//ID elemento 
	var id = owner+'-'+service;
	//Tipo de elemento
	var type="encuesta";
	//Estado actual
	var currentStatus = object.getStatus();
	//Array de posibles estados
	var status= object.getStatusSet(); 
	
	//Función con las acciones asociadas a cada estado del UIElement. 
	//Este swicth se pasará finalmente como parámetro, y será generado en un módulo aparte (actionsGenerator)
	var actions = "";
	
	//Array de posibles estados propios. "on" -> suscrito. "off"->no suscrito. "error" -> se produjo algún error en la suscripción
	var internalStatus= ["on","off","error"];
	//Estado interno actual. Por defecto desactivado. Cambia según resultado de la suscripción. Depende de internalStatus[]
	var currentInternalStatus = "off";

	/***** Métodos privados ******/

	
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
	this.getType = function(){
		return type;
	}
	this.setType = function(type){
		type = this.type;
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
	this.getActions = function(){
		return actions;
	}

};
