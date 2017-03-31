function PoaChat(){

	/* INTEGRADOR - INICIO VARIABLES */
	var listeners = [];							//Array de suscriptores al elemento
	var owner = "poa";							//Propietario del elemento
	var service = "chat";						//Servicio
	var instanceName = "poaChat";				//Nombre de la instancia del elemento en el DOM
	var currentStatus = "chatCreado";				//Guarda el estado actual de la encuesta. 
	var statusSet = ["chatCreado","modalSolicitudLanzado","modalSolicitudCerrado","modalConversacionLanzado","modalConversacionCerrado"]; //Array de posibles estados del elemento emergente
	/* INTEGRADOR - FIN VARIABLES */

	var modalSolicitud = 	'<div class="modal fade" id="modalSolicitud" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog modal-sm" role="document"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> <h4 class="modal-title" id="myModalLabel">POA chat</h4> </div><div class="modal-body"> Solicitud de chat </div><div class="modal-footer"> <button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button></div></div></div></div>';
	var modalConversacion = '<div class="modal fade" id="modalConversacion" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog modal-sm" role="document"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> <h4 class="modal-title" id="myModalLabel">POA chat</h4> </div><div class="modal-body"> Chatea con uno de nuestros asistentes </div><div class="modal-footer"> <button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button></div></div></div></div>';
	
	var thisPoaChat = this;
	/* INTEGRADOR - INICIO MÉTODOS PÚBLICOS */

	/**
	* Método de suscripción a eventos del chat de POA
	* @param func {Object} Función del uiElement que se desea obtener (proveedor-servicio)
 	* @return {boolean} Si se realiza correctamente la operación, devuelve true, en caso contrario, false
	*/
	this.onStateChatChange = function(func){
		try{
			if((typeof func != 'function')){
				//Depuración
				console.log(e);
				return false;
			}
			//Almacena función en el array de listeners
			listeners.push(func);
			return true;
		}
		catch(e){
			return false;
		}
	};

	this.lanzarModalSolicitud = function(){
		$("body").append(modalSolicitud);
		$("#modalSolicitud").modal('show');
		/* INTEGRADOR - INICIO CAMBIO DE ESTADO */
		setStatus("modalSolicitudLanzado");
		/* INTEGRADOR - FIN CAMBIO DE ESTADO */
	}

	this.cerrarModalSolicitud = function(){
		$("#modalSolicitud").modal('toggle');
		/* INTEGRADOR - INICIO CAMBIO DE ESTADO */
		setStatus("modalSolicitudCerrado");
		/* INTEGRADOR - FIN CAMBIO DE ESTADO */
	}

	this.lanzarModalConversacion = function(){
		$("body").append(modalConversacion);
		$("#modalConversacion").modal('show');
		/* INTEGRADOR - INICIO CAMBIO DE ESTADO */
		setStatus("modalConversacionLanzado");
		/* INTEGRADOR - FIN CAMBIO DE ESTADO */
	}

	this.cerrarModalConversacion = function(){
		$("#modalConversacion").modal('toggle');
		/* INTEGRADOR - INICIO CAMBIO DE ESTADO */
		setStatus("modalConversacionCerrado");
		/* INTEGRADOR - FIN CAMBIO DE ESTADO */
	}

	/**
	 * Método público para obetener el dueño (owner)
	 */
	this.getOwner = function(){
		return owner;
	};

	/**
	 * Método público para obetener el servicio asociado
	 */
	this.getService = function(){
		return service;
	};

	/**
	 * Devuelve valor de la variable currentStatus
	*/ 
	this.getCurrentStatus = function(){
		return currentStatus;
	}

	/**
	* Devuelve array de posibles estados
	*/ 
	this.getStatusSet = function(){
		return statusSet;
	}

	/**
	* Devuelve nombre de la instancia de la clase en el DOM
	*/ 
	this.getInstanceName = function(){
		return instanceName;
	}

	//PARTE PRIVADA

	//MÉTODOS PRIVADOS

	/* INTEGRADOR - INICIO MÉTODOS PRIVADOS */
	/*
	* Método que dispara las funciones almacenadas en el array
	* Se pasa como parámetro el estado actual y la instancia del chat POA en el DOM
	*/
	var triggerSuscription = function(){
		//Ejecuta las acciones del suscriptor si está definida la función
		for(var i=0; i<listeners.length; i++) {
			if (typeof listeners[i] == "function"){
				try{
					//Se pasa como parámetro el estado actual y la instancia del chat POA en el DOM
					listeners[i](currentStatus,thisPoaChat);	
					return true;
				}catch(e){
					//Depuración
					console.log(e);
					return false;
				}
			}
		}
	};

	/**
	 * Establece el valor de la variable status y lanza funciones asociadas a el estado recibido como parámetro
	 * @param new_status. Estado actual del modal del POA chat
	*/ 
	var setStatus = function(new_status){
		//cambia valor de la variable status
		currentStatus = new_status;
		//Ejecuta lanzamiento de funciones de suscripción
		triggerSuscription();
	}	

}

var poaChat = new PoaChat();
/* INTEGRADOR - INICIO TRIGGER INSTANCIACIÓN ELEMENTO */
//Si el objeto integrador existe, avisar al integrador de la instanciación dele elemento
if (typeof integrador == "object")
	integrador.elementReady("poaChat");
else
	//Depuración
	console.log("Error: el objeto integrador no está instanciado en el DOM");
/* INTEGRADOR - FIN TRIGGER INSTANCIACIÓN ELEMENTO */
