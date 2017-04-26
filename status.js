/**
* @fileoverview Status - Integrador
*
* @author POA Development Team
* @version 1.0
*/

function status(){ 

	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/

	//Nombre del estado
	var statusName = "";
	//Nombre del subestado asociado al estado 
	var subStatus = "";
	//Tipo de acción asociada al estado
	var actionType = "";
	//Código de error
	var errorCode = "";

	/***** Métodos privados ******/
	
	var getStatusName = function(){
		return statusName;
	}
	var setStatusName = function(statusName){
		statusName = this.statusName;
	}
	var getSubStatus = function(){
		return subStatus;
	}
	var setSubStatus = function(subStatus){
		subStatus = this.subStatus;
	}
	var getActionType = function(){
		return actionType;
	}
	var setActionType = function(actionType){
		actionType = this.actionType;
	}
	var getErrorCode = function(){
		return errorCode;
	}
	var setErrorCode = function(error){
		errorCode = this.error;
	}
	/**
	* Actualiza el estado
	* @param status {String} Nombre del estado
	* @param actionType {String} Tipo de acción
 	* @return 
	*/
	var statusUpdated = function(status,actionType){

	}	

	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

}