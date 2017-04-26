/**
* @fileoverview Response - Integrador
*
* @author POA Development Team
* @version 1.0
*/

function response(){ 

	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/

	//Identificador de la respuesta
	var id = ;
	//Código fuente a ejecutar como respuesta
	var responseCode = "";
	//Descripción textual de la respuesta
	var description = "";

	/***** Métodos privados ******/
	
	var getId = function(){
		return id;
	}
	var setId = function(id){
		id = this.id;
	}
	var getResponseCode = function(){
		return responseCode;
	}
	var setResponseCode = function(code){
		responseCode = this.code;
	}
	var getDescription = function(){
		return responseCode;
	}
	var setDescription = function(description){
		description = this.description;
	}

	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

}