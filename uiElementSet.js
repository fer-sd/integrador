function uiElementSet(){
	function init(){
		
	}
	
	// VARIABLES PRIVADAS //
	// id del elementSet instanciado
	var uiElementSetId = "9";
	// Array con la referenca a los uiElements Instanciados
	var uiElementsCont = [];
	
	// VARIABLES PÚBLICAS //
	
	/** METODOS PUBLICOS//
	* Método que debe invocar cualquier elemento que quiera interactuar	
	* @param object: String con el nombre del objeto
	* @param suscriptionFunction: String con el nombre del método de suscripción
	* @param suscriptionFunction: String con la función a ejecutar
	*/
	this.suscriptionRequest = function (object,suscriptionFunction,actionFunction){

		//Instancia objeto en base al nombre pasado como parámetro
		var myObject = window[object];
		//Comprueba que el objeto existe en el DOM
		if ((typeof(myObject)!=null) || (typeof(myObject)!=undefined)){
			//Añadir elemento al set
			addUiElement(myObject);
		}
		//Comprueba que la función de suscripción existe en la clase asociada al objeto
		var mySuscriptionFunction = object+'.'+suscriptionFunction;
		if ((typeof(eval(mySuscriptionFunction))=="function")){
			var mySuscriptionToken = object+'.'+suscriptionFunction+'('+actionFunction+')';
			//Ejecuta función de suscripción
			eval(mySuscriptionToken);
		}
	}
	
	// Método que rescata todos los uiElements almacenados
	this.getAllUiElements = function(){
		//return uiElementsCont.length + " - " + uiElementsCont;
		return uiElementsCont;
	}
	
	// Método que rescata cada uno de los uiElements almacenados
	this.getEachUiElements = function(){
		for ( c=0 ; c<uiElementsCont.length; c++){
			console.log(uiElementsCont[c].proveedor + " - " + uiElementsCont[c].servicio + " - " +  uiElementsCont[c].estado);
		}
	}
	
	// METODOS PRIVADOS //
	// Añade un uiElement al uiElementSet
	function addUiElement(data){
		/*
		*	definición del elemento que se va a añadir
		*/
		uiElementsCont.push(data);
	}
	
	// elimina un uiElement del uiElementSet
	function delUiElementSet(id){
		uiElementsCont.slide(id,parseInt(id)+1);
	}
	
	// Devuelve el númerio de uiElements Instanciados
	function uiElementSetCount(){
		return uiElementsCont.length;
	}
	
	init();
}

var integrador = new uiElementSet();