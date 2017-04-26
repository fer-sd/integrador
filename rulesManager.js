/**
* @fileoverview rulesManager - Integrador
*
* @author POA Development Team
* @version 1.0
*/

function rulesManager(){ 

	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/

	//Array de reglas
    var rules = [];

    //Array de respuestas
    var responses = [];

	/***** Métodos privados ******/

	/**
	* Método para extraer una regla del contenedor de reglas por su identificador
	* @param id {} Identificador de regla
	* @return rule {object} Si existe, devuelve la regla (objeto de tipo Rule). Si no existe o hay algún error, devuelve undefined
	*/
	var getRuleById = function(id){
		try{
			for (c=0 ; c<rules.length; c++){
	            if (rules[c].getId() == id)
	            	return rules[c];
	        }
			return undefined;
		}
		catch (e){
			console.log(e);
			return undefined;
		}	
	}

	/**
	* Método para extraer todas las reglas del contenedor asociadas a un tipo de acción
	* @param actionType {String} Tipo de acción
	* @return rulesSet {object} Devuelve array de reglas asociadas al tipo de acción
	*/
	var getRulesByActionType = function(actionType){
		try{
			//Contenedor auxiliar de reglas
			var rulesSet = [];
			//AÑADIR LO PRIMERO UNA COMPROBACIÓN DE QUE EXISTE EL TIPO DE ACCIÓN
			//SI ÉL TIPO DE ACCIÓN EXISTE...
			for (c=0 ; c<rules.length; c++){;
	            if (rules[c].getActionType() == actionType)
	            	rulesSet.push(rules[c]);
	        }
			return rulesSet;
		}
		catch (e){
			console.log(e);
		}	
	}

	/**
	* Método para extraer todas las reglas del contenedor
	* @return rules {object} Devuelve array de reglas
	*/
	var getAllRules = function(){
		return rules;	
	}

	/**
	* Constructor de reglas
    * @param  {} 
 	* @return {} 
	*/
	var setRule = function(){
		try{
			//Instanciación en función de parámetros del JSON externo
	    }
	    catch (e){
	    	console.log(e);
	    }
	}

	/**
	* Generador de contenedor de reglas
    * @param  {} 
 	* @return {} 
	*/
	var setRules = function(){
		try{
			//Recorrer JSON y llamar a setRule() tantas veces como reglas haya. 
			//Almacenar en array de reglas (rules[])
	    }
	    catch (e){
	    	console.log(e);
	    }
	}

	/**
	Método para eliminar una rule por su id pasada como parámetro
	* @param id {}
	* @return {boolean} Si existe, elimina la regla. Si no existe o hay algún error, devuelve false
	*/
    var removeRule = function(id){
    	try{
	    	for (c=0 ; c<rule.length; c++){
	            if (rule[c].getId() == id){
	            	rule.splice(c, 1);
	            	return true;
	            }
	        }
			return false;
		}
		catch (e){
			//Depuración
			console.log(e);
			return false;
		}
    }

	/**
	* Método para extraer una respuesta del contenedor de respuestas por su identificador
	* @param id {} Identificador de regla
	* @return response {object} Si existe, devuelve la response (objeto de tipo Response). Si no existe o hay algún error, devuelve undefined
	*/
	var getResponseById = function(id){
		try{
			for (c=0 ; c<responses.length; c++){
	            if (responses[c].getId() == id)
	            	return responses[c];
	        }
			return undefined;
		}
		catch (e){
			console.log(e);
			return undefined;
		}	
	}

	/**
	* Método para extraer todas las responses del contenedor
	* @return rules {object} Devuelve array de responses
	*/
	var getAllResponses = function(){
		return responses;	
	}

	/**
	* Constructor de responses
    * @param  {} 
 	* @return {} 
	*/
	var setResponse = function(){
		try{
			//Instanciación en función de parámetros del JSON externo
	    }
	    catch (e){
	    	console.log(e);
	    }
	}
	/**
	* Generador de contenedor de responses
    * @param  {} 
 	* @return {} 
	*/
	var setResponses = function(){
		try{
			//Recorrer JSON y llamar a setResponse() tantas veces como responses haya. 
			//Almacenar en array de responses (responses[])
	    }
	    catch (e){
	    	console.log(e);
	    }
	}

	/**
	Método para eliminar una response por su id pasada como parámetro
	* @param id {}
	* @return {boolean} Si existe, elimina la response. Si no existe o hay algún error, devuelve false
	*/
    var removeResponse = function(id){
    	try{
	    	for (c=0 ; c<responses.length; c++){
	            if (responses[c].getId() == id){
	            	responses.splice(c, 1);
	            	return true;
	            }
	        }
			return false;
		}
		catch (e){
			//Depuración
			console.log(e);
			return false;
		}
    }

	/**
    * Método inicial  
    **/
	var init = function(){
		//Cargar arrays desde info de JSON
	}

	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

	/**
	* Devuelve el número de reglas del contenedor
 	* @return {Integer} Número de rules que contiene el array
	*/
	this.getRulesSize = function(){
		return rules.length;
	}

	/**
	* Devuelve el número de respuestas del contenedor
 	* @return {Integer} Número de responses que contiene el array
	*/
	this.getResponsesSize = function(){
		return responses.length;
	}

	/**
	* Devuelve la respuesta (reacción) asociada a un tipo de acción
	* @param actionType {String}
 	* @return {Integer} Número de responses que contiene el array
	*/
	this.getResponse = function(actionType){
		//AÑADIR LO PRIMERO UNA COMPROBACIÓN DE QUE EXISTE EL TIPO DE ACCIÓN
		//SI ÉL TIPO DE ACCIÓN EXISTE...
		return;
	}

	/***** INICIALIZACIÓN ******/

	init();
}