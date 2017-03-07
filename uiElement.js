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
	var actions = function(csi_status,csi){
		var myStatus = csi.getStatusSet();
		//Recuperamos id del uiElement
		var myId = csi.getOwner()+"-"+csi.getService();
		//Recuperamos el uiElement
		var myUiElement	= integrador.getUiElement(myId);

		switch(csi_status) {
	    	case myStatus[0]:
		        console.log('Encuesta creada - Version encuesta CSI: '+csi.getVersion());
		        break;
		    case myStatus[1]:
		        console.log('Modal encuesta lanzado - Version encuesta CSI: '+csi.getVersion());
		        $('.usabilla_live_button_container').css('display','none');
		        console.log('Moquillo encuesta Usabilla cerrado por Integrador');
		        setTimeout(function(){csi.cerrarModalEncuesta();console.log('Modal encuesta cerrado por Integrador');}, 3000);
		        break;
	    	case myStatus[2]:
		        console.log('Modal encuesta cerrado - Version encuesta CSI: '+csi.getVersion());
		        break;
	    	case myStatus[3]:
		        console.log('Modal inicial lanzado - Version encuesta CSI: '+csi.getVersion());
	    		setTimeout(function(){csi.cerrarModalInicial();console.log('Modal inicial cerrado por Integrador');}, 3000);
		        break;
	    	case myStatus[4]:
		        console.log('Modal inicial cerrado - Version encuesta CSI: '+csi.getVersion());
		        break;
	    	case myStatus[5]:
		        console.log('Modal minimizado lanzado - Version encuesta CSI: '+csi.getVersion());
		        break;
	    	case myStatus[6]:
		        console.log('Modal minimizado cerrado - Version encuesta CSI: '+csi.getVersion());
		        break;
	    	default:
	        	console.log('Encuesta CSI versión ' +csi.getVersion());
		}
		//Cambio de estado del uiElement
	    console.log("Estado antes: "+myUiElement.getCurrentStatus());
	    myUiElement.setCurrentStatus(csi_status);
	    console.log("Estado después: "+myUiElement.getCurrentStatus());
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
