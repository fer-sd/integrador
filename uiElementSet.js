/**
* @fileoverview UIElementSet - Integrador
*
* @author POA Development Team
* @version 2.0
*/

function uiElementSet(){

	/***** PARTE PRIVADA ******/

	/***** Variables privadas ******/
       
    //Array con los uiElements instanciados
    var uiElements = [];

    //Instanciación del manejador de reglas (único para el uiElementSet)
    var rulesManager = new rulesManager();

	/***** Métodos privados ******/

	/**
	* Inicializa base de datos del integrador para usar indexeddb
	*/
	var startDb = function() {
        //Nombre: integrador. Versión: 1
        dataBase = indexedDB.open("integrador", 1);
 
        dataBase.onupgradeneeded = function (e) {
            active = dataBase.result;
            object = active.createObjectStore("uiElements", { keyPath : 'id', autoIncrement : false});
        };

        dataBase.onsuccess = function (e) {
            console.log('Base de datos cargada correctamente');
        };

        dataBase.onerror = function (e)  {
            console.log('Error cargando la base de datos');
        };
    }

	/**
	* Añade un uiElement a la indexeddb
	* @param id {String} id del uiElement a recuperar
	*/
	var addUiElementToDb = function(id) {
		try{
	        var active = dataBase.result;
	        var data = active.transaction("uiElements", "readwrite");
	        var object = data.objectStore("uiElements");
	        //Recuperamos uiElement del UiElementSet
	        var myUiElement = this.getUiElement(id);

	        //Los datos del uiElement tienen que ser guardados como Strings
	        //FALTA GUARDAR ESTADO ASOCIADO AL UIELEMENT (SI LO HUBIESE)
	        var request = object.put({
	            'owner' : myUiElement.getOwner(),
	            'service' : myUiElement.getService(),
	            'id' : myUiElement.getId(),
	            'internalStatus' : myUiElement.getInternalStatus(),
	            'status' : myUiElement.getStatus(),
	            'statusSet' : myUiElement.getStatusSet().toString(),
	            'possibleActions' : myUiElement.getPossibleActions().toString(),
	            'instanceRef' : myUiElement.getInstanceRef(),
	            'extraInfo'	: myUiElement.getExtraInfo().toString()
	        });

	        request.onerror = function (e) {
	            console.log(request.error.name + '\n\n' + request.error.message);
	        };
	    }
	    catch (e){
	    	console.log(e);
	    }
    }

	/**
	* Carga un uiElement desde la indexeddb
	* @param id {String} id del uiElement a recuperar
 	* @return 
	*/
    var getUiElementFromDb = function (id) {
    	try{
	        var active = dataBase.result;
	        var data = active.transaction("uiElements", "readonly");
	        var object = data.objectStore("uiElements");
	        var request = object.get(id);

	        request.onsuccess = function() {
	            var result = request.result;
	            //Existe información almacenada en la BBDD para el uiElement
	            if (result !== undefined) {
		        	//Instanciamos el elemento en base al nombre de la instancia almacenado en la BBDD
					var myInstance = window[result.instanceName];
					//Se comprueba que el uiElement existe en el DOM
			    	if ((typeof(myInstance)!=null) && (typeof(myInstance)!=undefined)){
			    		/* Inicio constructor del uiElement */
				    	//Creaciónn del uiElement
				    	var myUiElement = new uiElement(myInstance);
				    	//Restauración de atributos del uiElement desde la BBDD en su formato original
	            		myUiElement.setOwner(result.owner);
	            		myUiElement.setService(result.service);
				    	myUiElement.setId(result.owner,result.service);
				    	myUiElement.setInternalStatus(result.internalStatus);
				    	myUiElement.setStatus(result.status);
				    	myUiElement.setStatusSet(result.statusSet);
					    myUiElement.setPossibleActions(result.possibleActions);			    	
					    myUiElement.setInstanceRef(result.instanceRef);	
					    myUiElement.setExtraInfo(result.extraInfo);	

				    	//Recuperar estado asociado al uiElement (si lo hubiera)

						 //Añadir elemento restaurado al uiElementSet
						uiElements.push(myUiElement);

						return true;
				    }
			    	else{
						//Depuración
				        console.log('Integrador - El elemento ' + instanceName + ' no está instanciado en el DOM');
				        return false;
			    	} 
			    }
			    else{
			    	 //Depuración
				     console.log('Integrador - No existe información almacenada en la BBDD');
				     return false;

			    }
	        };
	    }
	    catch (e){
	    	console.log(e);
	    }
    }

	/**
	* Constructor de uiElements en base al nombre de la instancia del elemento pasado como parámetro
    * @param instanceName {String} Cadena con el nombre de la instancia asociada al uiElement instanciado
 	* @return {boolean} Si se realiza correctamente la operación, devuelve true, en caso contrario, false
	*/
	var setUiElement = function(instanceName){
		try{
			//Instanciamos el elemento en base al nombre pasado como parámetro
			var myInstance = window[instanceName];

			//Se comprueba que la instancia es correcta
	    	if ((typeof(myInstance)!=null) && (typeof(myInstance)!=undefined)){
	    		/* Inicio constructor del uiElement */
		    	//Creaciónn del uiElement
		    	var myUiElement = new uiElement(myInstance);
		    	//Asignación de nombre de la instancia del elemento original
		    	myUiElement.setInstanceName(instanceName);
		    	//Asignación de información extra
		    	myUiElement.setExtraInfo(myInstance.getInfo());
		    	//Añadir reglas

				uiElements.push(myUiElement);

				return true;
		    }
	    	else{
				//Depuración
		        console.log('Integrador - Ocurrió un error en la creación del uiElement ' + instanceName);
		        return false;
	    	} 
	    }
	    catch (e){
	    	console.log(e);
	    	return false;
	    }
	}

	/**
	Método para eliminar un uiElement identificado por su id pasada como parámetro
	* @param id {String} Cadena con el nombre del id del uiElement que se desea eliminar (proveedor-servicio)
	* @return {boolean} Si existe, elimina el uiElement. Si no existe o hay algún error, devuelve false
	*/
    var removeUiElement = function(id){
    	try{
	    	for (c=0 ; c<uiElements.length; c++){
	            if (uiElements[c].getId() == id){
	            	uiElements.splice(c, 1);
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
    * Método que invoca a la función suscripción del integrador al uiElement            
    * @param suscriptionFunction {String} Cadena con la llamada explícita a la función de suscripción
 	* @return {boolean} Si se realiza correctamente la operación, devuelve true, en caso contrario, false
   
    var suscriptionRequest = function(suscriptionFunction){
    	try{	    	
	       //Ejecuta la suscripción pasando como parámetro la función de acciones
	       //Evitamos uso de eval()
	       eval(suscriptionFunction);
	       return true;
		}
	    catch (e){
	    	//Depuración
	    	console.log(e);
	    	return false;
	    }	
	}
	 */

	/**
    * Método inicial  
    **/
	var init = function(){
		//Arrancar Indexeddb
		startDb();
	}


	/***** PARTE PÚBLICA ******/

	/***** Variables públicas ******/

	/***** Métodos públicos ******/

	/**
	* Método que controla el flujo de suscripción del Integrador a un uiElement
    * @param id {String} Cadena con la id del uiElement al que se quiere suscribir Integrador
    * @param suscriptionFunction {String} Cadena con el nombre de la función de suscripción
 	* @return {boolean} Si se realiza correctamente la operación, devuelve true, en caso contrario, false
	
	this.setSuscription = function(id,suscriptionFunction){
		try{
			//recuperamos uiElement asociado a la id recibida
    		var myUiElement = this.getUiElement(id);
    		//recuperamos nombre de la instancia del elemento asociado al uiElement
    		var myInstanceName = myUiElement.getInstanceName();
    		//creamos token con la función de suscripción (instancia.metodo())	
	    	var mySuscriptionFunction = myInstanceName+'.'+suscriptionFunction;
	    	//Comprueba que la instancia existe y la función de suscripción existe en la clase asociada a dicha instancia
	        if (typeof(eval(mySuscriptionFunction))=="function"){
	        	//Creamos token de llamada a la suscripción
		        //var mySuscriptionToken = mySuscriptionFunction+'('+myActions+')';
		        //Ejecutamos la llamada
		        if (suscriptionRequest(mySuscriptionToken)){
		        	//Si la suscripción se realiza correctamente, cambiamos estado del uiElemento a "on"
		        	//myUiElement.setCurrentInternalStatus("on");
		        	return true;
		        }
		        else{ 
		        	//Depuración
		        	console.log('Ocurrió un error en la suscripción al elemento ' + id);
		        	return false;
		        }
		    }
		    else{		        	
		    		//Depuración
		        	console.log('Integrador - Error de validación de tipos de dato del elemento ' + id);
		        	return false;

		    }
	    }
	    catch (e){
	    	console.log(e);
	    	return false;
	    }
	}
	*/

	/**
	* Método para extraer un uiElement pasado como parámetro
	* @param id {String} Cadena con el nombre del id del uiElement que se desea obtener (proveedor-servicio)
	* @return uiElement {object} Si existe, devuelve el uiElement. Si no existe o hay algún error, devuelve undefined
	*/
	this.getUiElement = function(id){
		try{
			for (c=0 ; c<uiElements.length; c++){
				//console.log(uiElements[c].getId());
	            if (uiElements[c].getId() == id)
	            	return uiElements[c];
	        }
			return undefined;
		}
		catch (e){
			console.log(e);
			return undefined;
		}	
	}





	this.getUiElementSet = function(){
		return uiElements;
	}

	/**
	* Recibe aviso de creación de instancia del elemento con nombre "instanceName" en el DOM y lanza creación del uiElement
	* @param instanceName {String} Cadena con el nombre de la instancia asociada al elemento externo
	*/
	this.elementReady = function(instanceName){
		try{
			var myInstance = window[instanceName];	
			var myId = myInstance.getOwner() + "-" + myInstance.getService();
						//Si el elemento no existe en el uiElementSet, lo crea
			if (this.getUiElement(myId) == undefined) {
				//Construye uiElement y lo incluye en el uiElementSet
				setUiElement(instanceName);
			}
			else{
				//El elemento ya existe en el uiElementSet
				console.log("Integrador - el elemento "+ instanceName +" ya está incluido en el Integrador");
			}
		}
		catch(e){
			//Depuración
			console.log(e);
		}
	}

	/***** INICIALIZACIÓN ******/

	init();
}
//Creación base de datos
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var dataBase = null;
//Constructor (instanciación del objeto)
var integrador = new uiElementSet();