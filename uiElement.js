/**
* @fileoverview UIElement - Integrador
*
* @author POA Development Team
* @version 2.0
*/

function uiElement(){ 
	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/

	//Propietario del elemento 
	var owner = ;
	//Servicio del propietario sobre el que se va a actuar
	var service = ; 
	//ID elemento 
	var id = owner+'-'+service;
	//Estado interno del uiElement (on/off), por defecto: on
	var internalStatus = "on";
	//Estado actual del elemento externo. Por defecto debería ser "created"
	var status = ;
	//Array de nombres de posibles estados para el elemento externo
	var statusSet= ; 
	//Array de posibles acciones (normalizar set)
	var possibleActions = ;
	//Puntero al objeto instanciado
	var instanceRef;
	//Informacion adicional
	var extraInfo = {};


	/***** Métodos privados ******/

	/**
	* Crea un nuevo estado para el uiElement
	* @param 
 	* @return
	*/
	var createStatus() = function(){

	}

	/**
	* Elimina un estado definido para un uiElement
	* @param 
 	* @return
	*/
	var removeStatus() = function(){

	}
	
	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

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
	this.getId = function(){
		return id;
	}
	this.setId = function(){
		//se concatena propietario y servicio
		id = owner.toLowerCase()+'-'+service.toLowerCase();
	}
	this.getInternalStatus = function(){
		return internalStatus;
	}
	this.setInternalStatus = function(status){
		internalStatus = this.status;
	}	
	this.getStatus = function(){
		return status;
	}
	this.setStatus = function(currentStatus){
		status = this.currentStatus;
	}
	this.getStatusSet = function(){
		return statusSet;
	}
	this.setStatusSet = function(statusSet){
		statusSet = this.statusSet;
	}
	this.getPossibleActions = function(){
		return possibleActions;
	}
	this.setPossibleActions = function(possibleActionsSet){
		possibleActions = possibleActionsSet;
	}
	this.getInstanceRef = function(){
		return instanceRef;
	}
	this.setInstanceRef = function(reference){
		instanceRef = reference;
	}
	this.getExtraInfo = function(){
		return extraInfo;
	}
	this.setExtraInfo = function(info){
		extraInfo = info;
	}
};