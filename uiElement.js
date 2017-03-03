/*
Clase UIElement - Integrador
*/

function uiElement(object){ 
	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
	//Propietario del elemento 
	var owner = object.owner;
	//Servicio del propietario sobre el que se va a actuar
	var service = object.service;
	//ID elemento 
	var id = object.owner+'-'+object.service;
	//Tipo de elemento
	var type="encuesta";
	//Estado actual
	var currentStatus = object.status;
	//Array de posibles estados
	var status= object.statusSet; 
	
	//Función con las acciones asociadas a cada estado del UIElement. 
	//Este swicth se pasará finalmente como parámetro, y será generado en un módulo aparte (actionsGenerator)
	var actions = function(csi_status,csi){
		var myStatus = csi.getStatusSet();
		switch(csi_status) {
	    	case myStatus[0]:
		        console.log('Encuesta creada - Version encuesta CSI: '+csi.getVersion());
		        //Notificar cambio de estado a uiElement
		        break;
		    case myStatus[1]:
		        console.log('Modal encuesta lanzado - Version encuesta CSI: '+csi.getVersion());
		        //Notificar cambio de estado a uiElement
		        break;
	    	case myStatus[2]:
		        console.log('Modal encuesta cerrado - Version encuesta CSI: '+csi.getVersion());
		        //Notificar cambio de estado a uiElement
		        break;
	    	case myStatus[3]:
		        console.log('Modal inicial lanzado - Version encuesta CSI: '+csi.getVersion());
	    		setTimeout(function(){csi.cerrarModalInicial()}, 3000);
	    		console.log('Modal inicial cerrado por Integrador');
		        //Notificar cambio de estado a uiElement
		        break;
	    	case myStatus[4]:
		        console.log('Modal inicial cerrado - Version encuesta CSI: '+csi.getVersion());
		        //Notificar cambio de estado a uiElement
		        break;
	    	case myStatus[5]:
		        console.log('Modal minimizado lanzado - Version encuesta CSI: '+csi.getVersion());
		        //Notificar cambio de estado a uiElement
		        break;
	    	case myStatus[6]:
		        console.log('Modal minimizado cerrado - Version encuesta CSI: '+csi.getVersion());
		        //Notificar cambio de estado a uiElement
		        break;
	    	default:
	        	console.log('Version encuesta CSI: '+csi.getVersion());
	        	//Notificar cambio de estado a uiElement
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
	this.setId = function(){
		//se concatena propietario y servicio
		id = this.owner+'-'+this.service;
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
