/*
Clase UIElement - Integrador
*/
function UIElement(){ 
	//Variables privadas

	//ID elemento 
	var id;
	//Tipo de elemento
	var type={chat, modal};
	//Propietario del elemento 
	var owner;
	//Servicio del propietario sobre el que se va a actuar
	var service;
	//Array de posibles estados
	var status= [];
	//Estado actual
	var currentStatus;
	//Estados propios
	var internalStatus= ["on","off","error"];
	//Estado interno actual. Por defecto desactivado
	var currentInternalStatus = "off";
	
	//Métodos públicos

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

	/*
	* Método público Enable específico para piloto de CSI
	* @param object: objeto ya instanciado
	*/
	this.enable = function(object){ 
		//suscripción a eventos
		if (object !== undefined){
			object.onStateCsiChange(function(current_status,csi){
				switch(current_status) {
			    	case "modalEncuestaLanzado":
				        console.log('Modal encuesta lanzado - Version encuesta CSI: '+csi.getVersion());
				        break;
			    	case "modalEncuestaCerrado":
				        console.log('Modal encuesta cerrado - Version encuesta CSI: '+csi.getVersion());
				        break;
			    	case "modalInicialLanzado":
				        console.log('Modal inicial lanzado - Version encuesta CSI: '+csi.getVersion());
				        break;
			    	case "modalInicialCerrado":
				        console.log('Modal inicial cerrado - Version encuesta CSI: '+csi.getVersion());
				        break;
			    	case "modalMinimizadoLanzado":
				        console.log('Modal minimizado lanzado - Version encuesta CSI: '+csi.getVersion());
				        break;
			    	case "modalMinimizadoCerrado":
				        console.log('Modal minimizado cerrado - Version encuesta CSI: '+csi.getVersion());
				        break;
			    	default:
			        	console.log('Version encuesta CSI: '+csi.getVersion());
				}
			});
		}
	} 
	/*
	* Método público Disable específico para piloto de CSI
	*/
	this.disable = function(){ 

	} 
} 