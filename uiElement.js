/*
Clase UIElement - Integrador
*/

function UIElement(){ 
	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
	
	//Objeto instanciado
	var object;
	//Propietario del elemento 
	var owner;
	//ID elemento 
	var id;
	//Tipo de elemento
	var type={chat, modal};
	//Servicio del propietario sobre el que se va a actuar
	var service;
	//Estado actual
	var currentStatus;
	//Array de posibles estados
	var status= [];
	//Función con las acciones asociadas a cada estado del UIElement. Depende de status[]
	var actions = function(csi_status,csi){
		switch(csi_status) {
	    	case "modalEncuestaLanzado": //status[0]
		        console.log('Modal encuesta lanzado - Version encuesta CSI: '+csi.getVersion());
		        currentStatus = csi_status;
		        break;
	    	case "modalEncuestaCerrado": //status[1]
		        console.log('Modal encuesta cerrado - Version encuesta CSI: '+csi.getVersion());
		        currentStatus = csi_status;
		        break;
	    	case "modalInicialLanzado": //status[2]
		        console.log('Modal inicial lanzado - Version encuesta CSI: '+csi.getVersion());
		        currentStatus = csi_status;
		        break;
	    	case "modalInicialCerrado": //status[3]
		        console.log('Modal inicial cerrado - Version encuesta CSI: '+csi.getVersion());
		        currentStatus = csi_status;
		        break;
	    	case "modalMinimizadoLanzado": //status[4]
		        console.log('Modal minimizado lanzado - Version encuesta CSI: '+csi.getVersion());
		        currentStatus = csi_status;
		        break;
	    	case "modalMinimizadoCerrado": //status[5]
		        console.log('Modal minimizado cerrado - Version encuesta CSI: '+csi.getVersion());
		        currentStatus = csi_status;
		        break;
	    	default:
	    		currentStatus = csi_status;
	        	console.log('Version encuesta CSI: '+csi.getVersion());
		}
	}
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
	this.setId = function(id){
		id = this.id;
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
	this.setStatus = function(status){
		status = this.status;
	}
	this.getCurrentStatus = function(){
		return currentStatus;
	}
	this.setCurrentStatus = function(status){
		currentStatus = this.status;
		//Reevaluar reglas
	}
	this.getCurrentInternalStatus = function(){
		return currentInternalStatus;
	}
	this.setCurrentInternalStatus = function(status){
		currentInternalStatus = this.status;
	}
	this.getActions = function(){
		return actions;
	}
};

//Constructor
var encuesta = new uiElement();