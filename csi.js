var csiVersion = "2.922"; //TEST INTEGRADOR

/** 
 * Objeto que representa la encuestas de satisfacción de movistar (CSI / EC) 
 * 
 * @param segmento {String} Obligatorio [particulares | empresas | canalPremium | aplicateca | comunidad | facturaInteractiva]  -- default "particulares"
 * ______________________________________________________________
 * 
 * Dependencias:
 * ______________________________________________________________
 * 
 * 		JQuery -> Necesario para ajustar algunos estilos
 * 		/estaticos/js/debug_error.js -> Depuración
 * 
 * TEST EN CONSOLA:

encuestaCSI.onStateCsiChange(function(current_status,csi){
if (current_status=="modalInicialLanzado"){
console.log('Lanzado Modal Inicial #1 - Version: '+csi.getVersion());
}
});

encuestaCSI.onStateCsiChange(function(current_status,csi){
if (current_status=="modalEncuestaLanzado"){
console.log('Lanzado Encuesta Inicial #1 - Version: '+csi.getVersion());
}
});

encuestaCSI.lanzarModalInicial();

 * 
 */
function EncuestaCSI(){
	
	//Variables
	var segmento = 'particulares';
	var version = csiVersion;
	var n_clicks_acum = 0;
	var v_obligaciones = [];						//Vector de funciones de oblicacion
	var v_exclusiones = [];							//Vector de funciones de exclusion
	var delayObligaciones = 15000;					//Tiempo de espera para lanzar la encuesta si se determina que es por obligación
	var normalDelay = 2000;							//Tiempo de espera hasta lanzar la encuesta (si aplica)							//
	var listeners = [];								//Array de suscriptores
	
	//Variables públicas para Integrador
	var owner = "csi";
	var service = "encuesta";
	var status = "creada";							//Guarda el estado actual de la encuesta
	var statusSet = ["creada", "modalEncuestaLanzado", "modalEncuestaCerrado", "modalInicialLanzado", "modalInicialCerrado", 
	"modalMinimizadoLanzado", "modalMinimizadoCerrado"];
	
	//Cookies
	var idCookieClicks = "CSI_clicks_acum";			//Contador numero de clics acumulados
	var idCookieUltima = "CSI_ultima";				//Identificador de la cookie que almacena la fecha (milisegundos) de la Última encuesta
	var idCookieMinimizada="CSI_minimizada";		//Identifica la cookie que almacena el bool sobre si minimizada o no.
	var idCookieURLInicio = "CSI_url_inicio";	//Identificador de cookie de URL de inicio de la encuesta (i.e. URL página donde salta el ModalInicial)
	var idCookiePageNameInicio = "CSI_page_name_inicio"; //Identificador de la cookie de page name de inicio de la encuesta (i.e. nombre página donde salta el ModalInicial)
	var idCookieEsMobile = "CSI_es_mobile";    		//Identificador de la cookie que determina si se ha lanzado la encuesta en un dispositivo mobile (i.e. res. pantalla < 640px)
	
	var expCookie = 100; 							//Expiración por defecto de la cookie en el navegador (dias) 
	var this_csi = this;							//Puntero para referenciar el contexto del objeto csi en tiempo de ejecución

	//Depuracion
	var csiDebug = null;
	try{
		csiDebug = new MovistarDebug("CSI-ERROR", "EncuestaCSI", version);
	}catch(error){
		if(typeof console != 'undefined'){
			console.log("No se puede inicalizar la variable de depuración. No habrá información de depuración");
			console.debug(error);
		}
	}
	
	/**
	 * Configuración de los elementos visuales para cada segmento. 
	 * 
	 * Si no configuración se considera probabilidad 100% y número de clics 0
	 * 
	 * Permite que de forma automática, bajo configuración, se levanten los distintos
	 * elementos visuales
	 * 
	 * El modal minimizado se lanza si se indicó que se lanzase
	 */
	var configs ={
			
		'particulares' : {
			'modalInicial' : {
				'probabilidad' : 20,
				'clics' : 0
			},
			'modalMinimizado' : {
				'clics' : 3
			},
			'validez' : 30
		},
		
		'empresas' : {
			'modalInicial' : {
				'probabilidad' : 50,
				'clics' : 3
			},
			'modalMinimizado' : {
				'clics' : 0
			},
			'validez' : 30
		},
		
		'comunidad' : {
			'modalInicial' : {
				'probabilidad' : 50, 
				'clics' : 0
			},
			'modalMinimizado' : {
				'clics' : 0
			},
			'validez' : 30
		},
		
		'canalPremium' : {
			'modalInicial' : {
				'probabilidad' : 50,
				'clics' : 3
			},
			'modalMinimizado' : {
				'clics' : 0
			},
			'validez' : 30
		},
		
		'aplicateca' : {
			'modalInicial' : {
				'probabilidad' : 100,
				'clics' : 3
			},
			//Salta directamente encuesta sin modal minimizado
			'validez' : 90
		},

		'facturaInteractiva' : {
			'modalInicial' : {
				'probabilidad' : 50,
				'clics' : 0 //debe saltar tras 1 minuto en FI
			},
			//Salta directamente encuesta sin modal minimizado
			'validez' : 30
		}
	};
	
	/**
	 * Flags que controlan el estado de los distintos modales
	 */
	var modalFlags = {
		'modalInicial' : false,
		'modalEncuesta' : false,
		'modalMinimizado': false
	};
	
	//Variable que contiene la pantalla inicial. Particulares-comunidad y empresas-CPRE comparten modal inicial
	var modalInicialHTM = {
		'particulares' 		: '<style>.csi-col-xs-1,.csi-col-xs-10,.csi-col-xs-11,.csi-col-xs-12,.csi-col-xs-2,.csi-col-xs-3,.csi-col-xs-4,.csi-col-xs-5,.csi-col-xs-6,.csi-col-xs-7,.csi-col-xs-8,.csi-col-xs-9,.csi-icono,.csi-title{float:left!important}.csi-mas-tarde,.csi-modal-container{font-family:TelefonicaLight!important}.csi-btn,.csi-mas-tarde,button.csi-close{cursor:pointer!important}a{text-decoration:none!important}.csi-margin0{margin:0!important}.csi-padding0{padding:0!important}.csi-center{display:table!important;margin:0 auto!important}.csi-z-index1{z-index:1!important}.csi-z-index2{z-index:2!important}.csi-z-index3{z-index:3!important}.csi-show{display:block!important}.csi-hide{display:none!important}.csi-row{margin-right:-15px!important;margin-left:-15px!important}.csi-row:after{clear:both!important}.csi-row:after,.csi-row:before{display:table!important;content:" "!important}*,:after,:before{-webkit-box-sizing:border-box!important;-moz-box-sizing:border-box!important;box-sizing:border-box!important}.csi-visible-xs,td.csi-visible-xs,th.csi-visible-xs,tr.csi-visible-xs{display:none!important}@media (max-width:767px){.csi-visible-xs{display:block!important}table.csi-visible-xs{display:table}tr.csi-visible-xs{display:table-row!important}td.csi-visible-xs,th.csi-visible-xs{display:table-cell!important}.csi-hidden-xs,td.csi-hidden-xs,th.csi-hidden-xs,tr.csi-hidden-xs{display:none!important}}.csi-col-lg-1,.csi-col-lg-10,.csi-col-lg-11,.csi-col-lg-12,.csi-col-lg-2,.csi-col-lg-3,.csi-col-lg-4,.csi-col-lg-5,.csi-col-lg-6,.csi-col-lg-7,.csi-col-lg-8,.csi-col-lg-9,.csi-col-md-1,.csi-col-md-10,.csi-col-md-11,.csi-col-md-12,.csi-col-md-2,.csi-col-md-3,.csi-col-md-4,.csi-col-md-5,.csi-col-md-6,.csi-col-md-7,.csi-col-md-8,.csi-col-md-9,.csi-col-sm-1,.csi-col-sm-10,.csi-col-sm-11,.csi-col-sm-12,.csi-col-sm-2,.csi-col-sm-3,.csi-col-sm-4,.csi-col-sm-5,.csi-col-sm-6,.csi-col-sm-7,.csi-col-sm-8,.csi-col-sm-9,.csi-col-xs-1,.csi-col-xs-10,.csi-col-xs-11,.csi-col-xs-12,.csi-col-xs-2,.csi-col-xs-3,.csi-col-xs-4,.csi-col-xs-5,.csi-col-xs-6,.csi-col-xs-7,.csi-col-xs-8,.csi-col-xs-9{position:relative!important;min-height:1px!important;padding-right:15px!important;padding-left:15px!important}.csi-col-xs-12{width:100%!important}.csi-col-xs-11{width:91.66666666666666%!important}.csi-col-xs-10{width:83.33333333333334%!important}.csi-col-xs-9{width:75%!important}.csi-col-xs-8{width:66.66666666666666%!important}.csi-col-xs-7{width:58.333333333333336%!important}.csi-col-xs-6{width:50%!important}.csi-col-xs-5{width:41.66666666666667%!important}.csi-col-xs-4{width:33.33333333333333%!important}.csi-col-xs-3{width:25%!important}.csi-col-xs-2{width:16.666666666666664%!important}.csi-col-xs-1{width:8.333333333333332%!important}.csi-col-xs-offset-12{margin-left:100%!important}.csi-col-xs-offset-11{margin-left:91.66666666666666%!important}.csi-col-xs-offset-10{margin-left:83.33333333333334%!important}.csi-col-xs-offset-9{margin-left:75%!important}.csi-col-xs-offset-8{margin-left:66.66666666666666%!important}.csi-col-xs-offset-7{margin-left:58.333333333333336%!important}.csi-col-xs-offset-6{margin-left:50%!important}.csi-col-xs-offset-5{margin-left:41.66666666666667%!important}.csi-col-xs-offset-4{margin-left:33.33333333333333%!important}.csi-col-xs-offset-3{margin-left:25%!important}.csi-col-xs-offset-2{margin-left:16.666666666666664%!important}.csi-col-xs-offset-1{margin-left:8.333333333333332%!important}.csi-col-xs-offset-0{margin-left:0!important}@media (min-width:768px){.csi-col-sm-1,.csi-col-sm-10,.csi-col-sm-11,.csi-col-sm-12,.csi-col-sm-2,.csi-col-sm-3,.csi-col-sm-4,.csi-col-sm-5,.csi-col-sm-6,.csi-col-sm-7,.csi-col-sm-8,.csi-col-sm-9{float:left!important}.csi-col-sm-1{width:8.333333333333332%!important}.csi-col-sm-2{width:16.666666666666664%!important}.csi-col-sm-3{width:25%!important}.csi-col-sm-4{width:33.33333333333333%!important}.csi-col-sm-5{width:41.66666666666667%!important}.csi-col-sm-6{width:50%!important}.csi-col-sm-7{width:58.333333333333336%!important}.csi-col-sm-8{width:66.66666666666666%!important}.csi-col-sm-9{width:75%!important}.csi-col-sm-10{width:83.33333333333334%!important}.csi-col-sm-11{width:91.66666666666666%!important}.csi-col-sm-12{width:100%!important}.csi-col-sm-offset-0{margin-left:0!important}.csi-col-sm-offset-1{margin-left:8.333333333333332%!important}.csi-col-sm-offset-2{margin-left:16.666666666666664%!important}.csi-col-sm-offset-3{margin-left:25%!important}.csi-col-sm-offset-4{margin-left:33.33333333333333%!important}.csi-col-sm-offset-5{margin-left:41.66666666666667%!important}.csi-col-sm-offset-6{margin-left:50%!important}.csi-col-sm-offset-7{margin-left:58.333333333333336%!important}.csi-col-sm-offset-8{margin-left:66.66666666666666%!important}.csi-col-sm-offset-9{margin-left:75%!important}.csi-col-sm-offset-10{margin-left:83.33333333333334%!important}.csi-col-sm-offset-11{margin-left:91.66666666666666%!important}}.csi-container,.csi-modal-container{margin-left:auto!important;margin-right:auto!important}.csi-container{padding-right:15px!important;padding-left:15px!important}.csi-icono{font-size:60px!important;color:#0086c3!important}.csi-texto-iconos{font-size:20px!important;color:#999!important}.csi-modal-mensaje{font-weight:400!important;line-height:normal!important;font-size:14px!important;color:#53575a!important;text-align:left!important}.csi-section{padding:5px 10px!important}.csi-footer{padding:19px 20px 20px 10px!important}.csi-separador{border-bottom-width:1px!important;border-bottom-style:solid!important;border-bottom-color:#e3e3e3!important}.csi-title{color:#005c84!important;font-size:30px!important;margin-top:initial!important}.csi-subtitle{font-size:24px!important;color:#005c84!important;text-align:left;border:none!important;font-weight:400!important;padding-left:0!important;margin-bottom:0!important}.csi-mas-tarde{font-size:18px!important;background-color:#005C84!important;color:#fff!important;border:none!important;height:36px!important;float:right!important}.csi-modal{padding-left:3%!important;padding-right:3%!important;position:absolute!important;top:0!important;left:0!important;background-color:rgba(0,0,0,.5)!important;width:100%!important;min-height:100%!important;z-index:999999!important;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#7f000000, endColorstr=#7f000000)}.csi-modal-container{background-color:#FFF!important;margin-top:5%!important;max-width:820px!important;font-size:14px!important;line-height:20px!important;color:#515559!important}.csi-close,.csi-close:focus,.csi-close:hover{float:right!important;font-size:20px!important;color:#005c84!important;text-decoration:none!important}.csi-modal-body{background:#fff!important;padding:10px!important}.csi-close:focus,.csi-close:hover{cursor:pointer!important;opacity:.8!important}button.csi-close{-webkit-appearance:none!important;padding:0!important;background:0 0!important;border:0!important}.csi-btn:focus,.csi-btn:hover{text-decoration:none!important}.csi-btn .span-text{margin-left:5px!important}.csi-btn{font:100 16px verdana!important;color:#fff!important;padding:5px 20px!important;border-radius:3px!important}</style><div class="csi-modal" id="csi-modal-inicial-bg" tabindex="-1" role="dialog" style="height: 4411px;"> <div class="csi-modal" id="csi-modal-inicial-bg" tabindex="-1" role="dialog" style="height: 4411px;"> <div class="csi-modal-container"> <div class="csi-modal-body"> <div class="csi-modal-mensaje" style="padding-bottom: 55px;"> <div class="csi-section csi-separador"> <div class="csi-row"> <div class="csi-col-xs-10"><span class="csi-title">Tu opinión nos importa</span></div><div class="csi-col-xs-2"><a class="csi-close csi-btn-close" onclick="encuestaCSI.cerrarModalInicial();" href="javascript:void(0);">X</a></div></div></div><div class="csi-section"> <div class="csi-row" style="margin-bottom: 20px;"> <div class="csi-col-xs-12" style="margin-bottom: 30px;"> <div class="csi-subtitle">¿Nos ayudas a mejorar?</div></div><div class="csi-col-xs-12 csi-col-sm-6"> <div class="icon-circular-tiempo csi-icono"></div><div style="padding-left: 80px;"><span class="csi-texto-iconos">Tan solo te pedimos 2 minutos de tu tiempo para rellenar esta pequeña encuesta.</span></div></div><div class="csi-col-xs-12 csi-visible-xs" style="height:30px"></div><div class="csi-col-xs-12 csi-col-sm-6"> <div class="icon-circular-pincha-aqui csi-icono"></div><div style="padding-left: 80px;"><span class="csi-texto-iconos">Cuando decidas completarla, pincha en el icono que estará minimizado abajo.</span></div></div></div></div><div class="csi-footer csi-separador"> <input class="csi-col-xs-12 csi-col-sm-3 csi-mas-tarde" value="MÁS TARDE" onclick="encuestaCSI.lanzarModalMinimizado(); return false;" type="button" style="margin-top: 36px;"> </div></div></div></div></div>',
		'empresas'     		: '<style>.csi-col-xs-1,.csi-col-xs-10,.csi-col-xs-11,.csi-col-xs-12,.csi-col-xs-2,.csi-col-xs-3,.csi-col-xs-4,.csi-col-xs-5,.csi-col-xs-6,.csi-col-xs-7,.csi-col-xs-8,.csi-col-xs-9,.csi-icono,.csi-title{float:left!important}.csi-mas-tarde,.csi-modal-container{font-family:TelefonicaLight!important}.csi-btn,.csi-mas-tarde,button.csi-close{cursor:pointer!important}a{text-decoration:none!important}.csi-margin0{margin:0!important}.csi-padding0{padding:0!important}.csi-center{display:table!important;margin:0 auto!important}.csi-z-index1{z-index:1!important}.csi-z-index2{z-index:2!important}.csi-z-index3{z-index:3!important}.csi-show{display:block!important}.csi-hide{display:none!important}.csi-row{margin-right:-15px!important;margin-left:-15px!important}.csi-row:after{clear:both!important}.csi-row:after,.csi-row:before{display:table!important;content:" "!important}*,:after,:before{-webkit-box-sizing:border-box!important;-moz-box-sizing:border-box!important;box-sizing:border-box!important}.csi-visible-xs,td.csi-visible-xs,th.csi-visible-xs,tr.csi-visible-xs{display:none!important}@media (max-width:767px){.csi-visible-xs{display:block!important}table.csi-visible-xs{display:table}tr.csi-visible-xs{display:table-row!important}td.csi-visible-xs,th.csi-visible-xs{display:table-cell!important}.csi-hidden-xs,td.csi-hidden-xs,th.csi-hidden-xs,tr.csi-hidden-xs{display:none!important}}.csi-col-lg-1,.csi-col-lg-10,.csi-col-lg-11,.csi-col-lg-12,.csi-col-lg-2,.csi-col-lg-3,.csi-col-lg-4,.csi-col-lg-5,.csi-col-lg-6,.csi-col-lg-7,.csi-col-lg-8,.csi-col-lg-9,.csi-col-md-1,.csi-col-md-10,.csi-col-md-11,.csi-col-md-12,.csi-col-md-2,.csi-col-md-3,.csi-col-md-4,.csi-col-md-5,.csi-col-md-6,.csi-col-md-7,.csi-col-md-8,.csi-col-md-9,.csi-col-sm-1,.csi-col-sm-10,.csi-col-sm-11,.csi-col-sm-12,.csi-col-sm-2,.csi-col-sm-3,.csi-col-sm-4,.csi-col-sm-5,.csi-col-sm-6,.csi-col-sm-7,.csi-col-sm-8,.csi-col-sm-9,.csi-col-xs-1,.csi-col-xs-10,.csi-col-xs-11,.csi-col-xs-12,.csi-col-xs-2,.csi-col-xs-3,.csi-col-xs-4,.csi-col-xs-5,.csi-col-xs-6,.csi-col-xs-7,.csi-col-xs-8,.csi-col-xs-9{position:relative!important;min-height:1px!important;padding-right:15px!important;padding-left:15px!important}.csi-col-xs-12{width:100%!important}.csi-col-xs-11{width:91.66666666666666%!important}.csi-col-xs-10{width:83.33333333333334%!important}.csi-col-xs-9{width:75%!important}.csi-col-xs-8{width:66.66666666666666%!important}.csi-col-xs-7{width:58.333333333333336%!important}.csi-col-xs-6{width:50%!important}.csi-col-xs-5{width:41.66666666666667%!important}.csi-col-xs-4{width:33.33333333333333%!important}.csi-col-xs-3{width:25%!important}.csi-col-xs-2{width:16.666666666666664%!important}.csi-col-xs-1{width:8.333333333333332%!important}.csi-col-xs-offset-12{margin-left:100%!important}.csi-col-xs-offset-11{margin-left:91.66666666666666%!important}.csi-col-xs-offset-10{margin-left:83.33333333333334%!important}.csi-col-xs-offset-9{margin-left:75%!important}.csi-col-xs-offset-8{margin-left:66.66666666666666%!important}.csi-col-xs-offset-7{margin-left:58.333333333333336%!important}.csi-col-xs-offset-6{margin-left:50%!important}.csi-col-xs-offset-5{margin-left:41.66666666666667%!important}.csi-col-xs-offset-4{margin-left:33.33333333333333%!important}.csi-col-xs-offset-3{margin-left:25%!important}.csi-col-xs-offset-2{margin-left:16.666666666666664%!important}.csi-col-xs-offset-1{margin-left:8.333333333333332%!important}.csi-col-xs-offset-0{margin-left:0!important}@media (min-width:768px){.csi-col-sm-1,.csi-col-sm-10,.csi-col-sm-11,.csi-col-sm-12,.csi-col-sm-2,.csi-col-sm-3,.csi-col-sm-4,.csi-col-sm-5,.csi-col-sm-6,.csi-col-sm-7,.csi-col-sm-8,.csi-col-sm-9{float:left!important}.csi-col-sm-1{width:8.333333333333332%!important}.csi-col-sm-2{width:16.666666666666664%!important}.csi-col-sm-3{width:25%!important}.csi-col-sm-4{width:33.33333333333333%!important}.csi-col-sm-5{width:41.66666666666667%!important}.csi-col-sm-6{width:50%!important}.csi-col-sm-7{width:58.333333333333336%!important}.csi-col-sm-8{width:66.66666666666666%!important}.csi-col-sm-9{width:75%!important}.csi-col-sm-10{width:83.33333333333334%!important}.csi-col-sm-11{width:91.66666666666666%!important}.csi-col-sm-12{width:100%!important}.csi-col-sm-offset-0{margin-left:0!important}.csi-col-sm-offset-1{margin-left:8.333333333333332%!important}.csi-col-sm-offset-2{margin-left:16.666666666666664%!important}.csi-col-sm-offset-3{margin-left:25%!important}.csi-col-sm-offset-4{margin-left:33.33333333333333%!important}.csi-col-sm-offset-5{margin-left:41.66666666666667%!important}.csi-col-sm-offset-6{margin-left:50%!important}.csi-col-sm-offset-7{margin-left:58.333333333333336%!important}.csi-col-sm-offset-8{margin-left:66.66666666666666%!important}.csi-col-sm-offset-9{margin-left:75%!important}.csi-col-sm-offset-10{margin-left:83.33333333333334%!important}.csi-col-sm-offset-11{margin-left:91.66666666666666%!important}}.csi-container,.csi-modal-container{margin-left:auto!important;margin-right:auto!important}.csi-container{padding-right:15px!important;padding-left:15px!important}.csi-icono{font-size:60px!important;color:#0086c3!important}.csi-texto-iconos{font-size:20px!important;color:#999!important}.csi-modal-mensaje{font-weight:400!important;line-height:normal!important;font-size:14px!important;color:#53575a!important;text-align:left!important}.csi-section{padding:5px 10px!important}.csi-footer{padding:0px 20px 20px 0px!important;}.csi-separador{border-bottom-width:1px!important;border-bottom-style:solid!important;border-bottom-color:#e3e3e3!important}.csi-title{color:#005c84!important;font-size:30px!important;margin-top:initial!important}.csi-subtitle{font-size:24px!important;color:#005c84!important;text-align:left;border:none!important;font-weight:400!important;padding-left:0!important;margin-bottom:0!important}.csi-mas-tarde{font-size:18px!important;background-color:#005C84!important;color:#fff!important;border:none!important;height:36px!important;float:right!important}.csi-modal{padding-left:3%!important;padding-right:3%!important;position:absolute!important;top:0!important;left:0!important;background-color:rgba(0,0,0,.5)!important;width:100%!important;min-height:100%!important;z-index:999999!important;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#7f000000, endColorstr=#7f000000)}.csi-modal-container{background-color:#FFF!important;margin-top:5%!important;max-width:820px!important;font-size:14px!important;line-height:20px!important;color:#515559!important}.csi-close,.csi-close:focus,.csi-close:hover{float:right!important;font-size:20px!important;color:#005c84!important;text-decoration:none!important}.csi-modal-body{background:#fff!important;padding:10px!important}.csi-close:focus,.csi-close:hover{cursor:pointer!important;opacity:.8!important}button.csi-close{-webkit-appearance:none!important;padding:0!important;background:0 0!important;border:0!important}.csi-btn:focus,.csi-btn:hover{text-decoration:none!important}.csi-btn .span-text{margin-left:5px!important}.csi-btn{font:100 16px verdana!important;color:#fff!important;padding:5px 20px!important;border-radius:3px!important}</style><div class="csi-modal" id="csi-modal-inicial-bg" tabindex="-1" role="dialog" style="height: 4411px;"><div class="csi-modal" id="csi-modal-inicial-bg" tabindex="-1" role="dialog" style="height: 4411px;"> <div class="csi-modal-container"> <div class="csi-modal-body"> <div class="csi-modal-mensaje" style="padding-bottom: 55px;"> <div class="csi-section csi-separador"> <div class="csi-row"> <div class="csi-col-xs-10"><span class="csi-title">Su opinión nos importa</span></div><div class="csi-col-xs-2"><a class="csi-close csi-btn-close" onclick="encuestaCSI.cerrarModalInicial();" href="javascript:void(0);">X</a></div></div></div><div class="csi-section"> <div class="csi-row" style="margin-bottom: 20px;"> <div class="csi-col-xs-12" style="margin-bottom: 30px;"> <div class="csi-subtitle">¿Nos ayuda a mejorar?</div></div><div class="csi-col-xs-12 csi-col-sm-6"> <div class="icon-circular-tiempo csi-icono"></div><div style="padding-left: 80px;"><span class="csi-texto-iconos">Tan solo le pedimos 2 minutos de su tiempo para rellenar esta pequeña encuesta.</span></div></div><div class="csi-col-xs-12 csi-visible-xs" style="height:30px"></div><div class="csi-col-xs-12 csi-col-sm-6"> <div class="icon-circular-pincha-aqui csi-icono"></div><div style="padding-left: 80px;"><span class="csi-texto-iconos">Cuando decida completarla, pinche en el icono que estará minimizado abajo.</span></div></div></div></div><div class="csi-footer csi-separador"> <input class="csi-col-xs-12 csi-col-sm-3 csi-mas-tarde" value="MÁS TARDE" onclick="encuestaCSI.lanzarModalMinimizado(); return false;" type="button" style="margin-top: 36px;"> </div></div></div></div></div>',		
		'canalPremium' 		: '<style>.csi-col-xs-1,.csi-col-xs-10,.csi-col-xs-11,.csi-col-xs-12,.csi-col-xs-2,.csi-col-xs-3,.csi-col-xs-4,.csi-col-xs-5,.csi-col-xs-6,.csi-col-xs-7,.csi-col-xs-8,.csi-col-xs-9,.csi-icono,.csi-title{float:left!important}.csi-mas-tarde,.csi-modal-container{font-family:TelefonicaLight!important}.csi-btn,.csi-mas-tarde,button.csi-close{cursor:pointer!important}a{text-decoration:none!important}.csi-margin0{margin:0!important}.csi-padding0{padding:0!important}.csi-center{display:table!important;margin:0 auto!important}.csi-z-index1{z-index:1!important}.csi-z-index2{z-index:2!important}.csi-z-index3{z-index:3!important}.csi-show{display:block!important}.csi-hide{display:none!important}.csi-row{margin-right:-15px!important;margin-left:-15px!important}.csi-row:after{clear:both!important}.csi-row:after,.csi-row:before{display:table!important;content:" "!important}*,:after,:before{-webkit-box-sizing:border-box!important;-moz-box-sizing:border-box!important;box-sizing:border-box!important}.csi-visible-xs,td.csi-visible-xs,th.csi-visible-xs,tr.csi-visible-xs{display:none!important}@media (max-width:767px){.csi-visible-xs{display:block!important}table.csi-visible-xs{display:table}tr.csi-visible-xs{display:table-row!important}td.csi-visible-xs,th.csi-visible-xs{display:table-cell!important}.csi-hidden-xs,td.csi-hidden-xs,th.csi-hidden-xs,tr.csi-hidden-xs{display:none!important}}.csi-col-lg-1,.csi-col-lg-10,.csi-col-lg-11,.csi-col-lg-12,.csi-col-lg-2,.csi-col-lg-3,.csi-col-lg-4,.csi-col-lg-5,.csi-col-lg-6,.csi-col-lg-7,.csi-col-lg-8,.csi-col-lg-9,.csi-col-md-1,.csi-col-md-10,.csi-col-md-11,.csi-col-md-12,.csi-col-md-2,.csi-col-md-3,.csi-col-md-4,.csi-col-md-5,.csi-col-md-6,.csi-col-md-7,.csi-col-md-8,.csi-col-md-9,.csi-col-sm-1,.csi-col-sm-10,.csi-col-sm-11,.csi-col-sm-12,.csi-col-sm-2,.csi-col-sm-3,.csi-col-sm-4,.csi-col-sm-5,.csi-col-sm-6,.csi-col-sm-7,.csi-col-sm-8,.csi-col-sm-9,.csi-col-xs-1,.csi-col-xs-10,.csi-col-xs-11,.csi-col-xs-12,.csi-col-xs-2,.csi-col-xs-3,.csi-col-xs-4,.csi-col-xs-5,.csi-col-xs-6,.csi-col-xs-7,.csi-col-xs-8,.csi-col-xs-9{position:relative!important;min-height:1px!important;padding-right:15px!important;padding-left:15px!important}.csi-col-xs-12{width:100%!important}.csi-col-xs-11{width:91.66666666666666%!important}.csi-col-xs-10{width:83.33333333333334%!important}.csi-col-xs-9{width:75%!important}.csi-col-xs-8{width:66.66666666666666%!important}.csi-col-xs-7{width:58.333333333333336%!important}.csi-col-xs-6{width:50%!important}.csi-col-xs-5{width:41.66666666666667%!important}.csi-col-xs-4{width:33.33333333333333%!important}.csi-col-xs-3{width:25%!important}.csi-col-xs-2{width:16.666666666666664%!important}.csi-col-xs-1{width:8.333333333333332%!important}.csi-col-xs-offset-12{margin-left:100%!important}.csi-col-xs-offset-11{margin-left:91.66666666666666%!important}.csi-col-xs-offset-10{margin-left:83.33333333333334%!important}.csi-col-xs-offset-9{margin-left:75%!important}.csi-col-xs-offset-8{margin-left:66.66666666666666%!important}.csi-col-xs-offset-7{margin-left:58.333333333333336%!important}.csi-col-xs-offset-6{margin-left:50%!important}.csi-col-xs-offset-5{margin-left:41.66666666666667%!important}.csi-col-xs-offset-4{margin-left:33.33333333333333%!important}.csi-col-xs-offset-3{margin-left:25%!important}.csi-col-xs-offset-2{margin-left:16.666666666666664%!important}.csi-col-xs-offset-1{margin-left:8.333333333333332%!important}.csi-col-xs-offset-0{margin-left:0!important}@media (min-width:768px){.csi-col-sm-1,.csi-col-sm-10,.csi-col-sm-11,.csi-col-sm-12,.csi-col-sm-2,.csi-col-sm-3,.csi-col-sm-4,.csi-col-sm-5,.csi-col-sm-6,.csi-col-sm-7,.csi-col-sm-8,.csi-col-sm-9{float:left!important}.csi-col-sm-1{width:8.333333333333332%!important}.csi-col-sm-2{width:16.666666666666664%!important}.csi-col-sm-3{width:25%!important}.csi-col-sm-4{width:33.33333333333333%!important}.csi-col-sm-5{width:41.66666666666667%!important}.csi-col-sm-6{width:50%!important}.csi-col-sm-7{width:58.333333333333336%!important}.csi-col-sm-8{width:66.66666666666666%!important}.csi-col-sm-9{width:75%!important}.csi-col-sm-10{width:83.33333333333334%!important}.csi-col-sm-11{width:91.66666666666666%!important}.csi-col-sm-12{width:100%!important}.csi-col-sm-offset-0{margin-left:0!important}.csi-col-sm-offset-1{margin-left:8.333333333333332%!important}.csi-col-sm-offset-2{margin-left:16.666666666666664%!important}.csi-col-sm-offset-3{margin-left:25%!important}.csi-col-sm-offset-4{margin-left:33.33333333333333%!important}.csi-col-sm-offset-5{margin-left:41.66666666666667%!important}.csi-col-sm-offset-6{margin-left:50%!important}.csi-col-sm-offset-7{margin-left:58.333333333333336%!important}.csi-col-sm-offset-8{margin-left:66.66666666666666%!important}.csi-col-sm-offset-9{margin-left:75%!important}.csi-col-sm-offset-10{margin-left:83.33333333333334%!important}.csi-col-sm-offset-11{margin-left:91.66666666666666%!important}}.csi-container,.csi-modal-container{margin-left:auto!important;margin-right:auto!important}.csi-container{padding-right:15px!important;padding-left:15px!important}.csi-icono{font-size:60px!important;color:#0086c3!important}.csi-texto-iconos{font-size:20px!important;color:#999!important}.csi-modal-mensaje{font-weight:400!important;line-height:normal!important;font-size:14px!important;color:#53575a!important;text-align:left!important}.csi-section{padding:5px 10px!important}.csi-footer{padding:0px 20px 20px 0px!important;}.csi-separador{border-bottom-width:1px!important;border-bottom-style:solid!important;border-bottom-color:#e3e3e3!important}.csi-title{color:#005c84!important;font-size:30px!important;margin-top:initial!important}.csi-subtitle{font-size:24px!important;color:#005c84!important;text-align:left;border:none!important;font-weight:400!important;padding-left:0!important;margin-bottom:0!important}.csi-mas-tarde{font-size:18px!important;background-color:#005C84!important;color:#fff!important;border:none!important;height:36px!important;float:right!important}.csi-modal{padding-left:3%!important;padding-right:3%!important;position:absolute!important;top:0!important;left:0!important;background-color:rgba(0,0,0,.5)!important;width:100%!important;min-height:100%!important;z-index:999999!important;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#7f000000, endColorstr=#7f000000)}.csi-modal-container{background-color:#FFF!important;margin-top:5%!important;max-width:820px!important;font-size:14px!important;line-height:20px!important;color:#515559!important}.csi-close,.csi-close:focus,.csi-close:hover{float:right!important;font-size:20px!important;color:#005c84!important;text-decoration:none!important}.csi-modal-body{background:#fff!important;padding:10px!important}.csi-close:focus,.csi-close:hover{cursor:pointer!important;opacity:.8!important}button.csi-close{-webkit-appearance:none!important;padding:0!important;background:0 0!important;border:0!important}.csi-btn:focus,.csi-btn:hover{text-decoration:none!important}.csi-btn .span-text{margin-left:5px!important}.csi-btn{font:100 16px verdana!important;color:#fff!important;padding:5px 20px!important;border-radius:3px!important}</style><div class="csi-modal" id="csi-modal-inicial-bg" tabindex="-1" role="dialog" style="height: 4411px;"><div class="csi-modal" id="csi-modal-inicial-bg" tabindex="-1" role="dialog" style="height: 4411px;"> <div class="csi-modal-container"> <div class="csi-modal-body"> <div class="csi-modal-mensaje" style="padding-bottom: 55px;"> <div class="csi-section csi-separador"> <div class="csi-row"> <div class="csi-col-xs-10"><span class="csi-title">Su opinión nos importa</span></div><div class="csi-col-xs-2"><a class="csi-close csi-btn-close" onclick="encuestaCSI.cerrarModalInicial();" href="javascript:void(0);">X</a></div></div></div><div class="csi-section"> <div class="csi-row" style="margin-bottom: 20px;"> <div class="csi-col-xs-12" style="margin-bottom: 30px;"> <div class="csi-subtitle">¿Nos ayuda a mejorar?</div></div><div class="csi-col-xs-12 csi-col-sm-6"> <div class="icon-circular-tiempo csi-icono"></div><div style="padding-left: 80px;"><span class="csi-texto-iconos">Tan solo le pedimos 2 minutos de su tiempo para rellenar esta pequeña encuesta.</span></div></div><div class="csi-col-xs-12 csi-visible-xs" style="height:30px"></div><div class="csi-col-xs-12 csi-col-sm-6"> <div class="icon-circular-pincha-aqui csi-icono"></div><div style="padding-left: 80px;"><span class="csi-texto-iconos">Cuando decida completarla, pinche en el icono que estará minimizado abajo.</span></div></div></div></div><div class="csi-footer csi-separador"> <input class="csi-col-xs-12 csi-col-sm-3 csi-mas-tarde" value="MÁS TARDE" onclick="encuestaCSI.lanzarModalMinimizado(); return false;" type="button" style="margin-top: 36px;"> </div></div></div></div></div>',
		'aplicateca'   		: '<div style="font: 12px Verdana, Helvetica, sans-serif; color: #4b4b4b; text-align: center; background: none;"><div style="color: #005179; font-size: 25px; padding-left: 15px; text-align: left; padding-bottom: 10px; margin-top: 60px;">Encuesta online movistar.es</div><div style="float: left; text-align: left; width: 93%; padding: 20px;"><p style="font-size: 14px; font-family: Verdana;">¿Nos ayudas a mejorar? Tan sólo te pedimos 2 minutos de tu tiempo para rellenar esta pequeña encuesta.</p><p style="font-weight: bold; font-family: Arial; font-size: 13px;">Cuando decidas completarla, pincha en el icono que estará minimizado abajo. Tu opinión nos importa.</p><div style="text-align: center;"><img src="//www.movistar.es/estaticos/img/es_ES/img-encuesta-particulares.png" alt=""></div><div style="position: absolute; bottom: 0; width: 90%;"><div style="border-bottom: solid 1px #E3E3E3; width: 100%; margin-bottom: 10px;">&nbsp;</div><input value="Rellenar más tarde"onclick="encuestaCSI.lanzarModalMinimizado(); return false;"style="width: 145px; background-color: #005c84; color: white; font-weight: bold; padding: 6px 10px; margin-right: 20px; border: none; float: right; cursor: pointer; margin-bottom: 10px;"type="button"><input value="Rellenar ahora"onclick="encuestaCSI.lanzarModalEncuesta(); return false;"style="width: 145px; background-color: #005c84; color: white; font-weight: bold; padding: 6px 10px; margin-right: 20px; border: none; float: right; cursor: pointer; margin-bottom: 10px;"type="button"></div></div></div>',
		'comunidad'    		: '<style>.csi-col-xs-1,.csi-col-xs-10,.csi-col-xs-11,.csi-col-xs-12,.csi-col-xs-2,.csi-col-xs-3,.csi-col-xs-4,.csi-col-xs-5,.csi-col-xs-6,.csi-col-xs-7,.csi-col-xs-8,.csi-col-xs-9,.csi-icono,.csi-title{float:left!important}.csi-mas-tarde,.csi-modal-container{font-family:TelefonicaLight!important}.csi-btn,.csi-mas-tarde,button.csi-close{cursor:pointer!important}a{text-decoration:none!important}.csi-margin0{margin:0!important}.csi-padding0{padding:0!important}.csi-center{display:table!important;margin:0 auto!important}.csi-z-index1{z-index:1!important}.csi-z-index2{z-index:2!important}.csi-z-index3{z-index:3!important}.csi-show{display:block!important}.csi-hide{display:none!important}.csi-row{margin-right:-15px!important;margin-left:-15px!important}.csi-row:after{clear:both!important}.csi-row:after,.csi-row:before{display:table!important;content:" "!important}*,:after,:before{-webkit-box-sizing:border-box!important;-moz-box-sizing:border-box!important;box-sizing:border-box!important}.csi-visible-xs,td.csi-visible-xs,th.csi-visible-xs,tr.csi-visible-xs{display:none!important}@media (max-width:767px){.csi-visible-xs{display:block!important}table.csi-visible-xs{display:table}tr.csi-visible-xs{display:table-row!important}td.csi-visible-xs,th.csi-visible-xs{display:table-cell!important}.csi-hidden-xs,td.csi-hidden-xs,th.csi-hidden-xs,tr.csi-hidden-xs{display:none!important}}.csi-col-lg-1,.csi-col-lg-10,.csi-col-lg-11,.csi-col-lg-12,.csi-col-lg-2,.csi-col-lg-3,.csi-col-lg-4,.csi-col-lg-5,.csi-col-lg-6,.csi-col-lg-7,.csi-col-lg-8,.csi-col-lg-9,.csi-col-md-1,.csi-col-md-10,.csi-col-md-11,.csi-col-md-12,.csi-col-md-2,.csi-col-md-3,.csi-col-md-4,.csi-col-md-5,.csi-col-md-6,.csi-col-md-7,.csi-col-md-8,.csi-col-md-9,.csi-col-sm-1,.csi-col-sm-10,.csi-col-sm-11,.csi-col-sm-12,.csi-col-sm-2,.csi-col-sm-3,.csi-col-sm-4,.csi-col-sm-5,.csi-col-sm-6,.csi-col-sm-7,.csi-col-sm-8,.csi-col-sm-9,.csi-col-xs-1,.csi-col-xs-10,.csi-col-xs-11,.csi-col-xs-12,.csi-col-xs-2,.csi-col-xs-3,.csi-col-xs-4,.csi-col-xs-5,.csi-col-xs-6,.csi-col-xs-7,.csi-col-xs-8,.csi-col-xs-9{position:relative!important;min-height:1px!important;padding-right:15px!important;padding-left:15px!important}.csi-col-xs-12{width:100%!important}.csi-col-xs-11{width:91.66666666666666%!important}.csi-col-xs-10{width:83.33333333333334%!important}.csi-col-xs-9{width:75%!important}.csi-col-xs-8{width:66.66666666666666%!important}.csi-col-xs-7{width:58.333333333333336%!important}.csi-col-xs-6{width:50%!important}.csi-col-xs-5{width:41.66666666666667%!important}.csi-col-xs-4{width:33.33333333333333%!important}.csi-col-xs-3{width:25%!important}.csi-col-xs-2{width:16.666666666666664%!important}.csi-col-xs-1{width:8.333333333333332%!important}.csi-col-xs-offset-12{margin-left:100%!important}.csi-col-xs-offset-11{margin-left:91.66666666666666%!important}.csi-col-xs-offset-10{margin-left:83.33333333333334%!important}.csi-col-xs-offset-9{margin-left:75%!important}.csi-col-xs-offset-8{margin-left:66.66666666666666%!important}.csi-col-xs-offset-7{margin-left:58.333333333333336%!important}.csi-col-xs-offset-6{margin-left:50%!important}.csi-col-xs-offset-5{margin-left:41.66666666666667%!important}.csi-col-xs-offset-4{margin-left:33.33333333333333%!important}.csi-col-xs-offset-3{margin-left:25%!important}.csi-col-xs-offset-2{margin-left:16.666666666666664%!important}.csi-col-xs-offset-1{margin-left:8.333333333333332%!important}.csi-col-xs-offset-0{margin-left:0!important}@media (min-width:768px){.csi-col-sm-1,.csi-col-sm-10,.csi-col-sm-11,.csi-col-sm-12,.csi-col-sm-2,.csi-col-sm-3,.csi-col-sm-4,.csi-col-sm-5,.csi-col-sm-6,.csi-col-sm-7,.csi-col-sm-8,.csi-col-sm-9{float:left!important}.csi-col-sm-1{width:8.333333333333332%!important}.csi-col-sm-2{width:16.666666666666664%!important}.csi-col-sm-3{width:25%!important}.csi-col-sm-4{width:33.33333333333333%!important}.csi-col-sm-5{width:41.66666666666667%!important}.csi-col-sm-6{width:50%!important}.csi-col-sm-7{width:58.333333333333336%!important}.csi-col-sm-8{width:66.66666666666666%!important}.csi-col-sm-9{width:75%!important}.csi-col-sm-10{width:83.33333333333334%!important}.csi-col-sm-11{width:91.66666666666666%!important}.csi-col-sm-12{width:100%!important}.csi-col-sm-offset-0{margin-left:0!important}.csi-col-sm-offset-1{margin-left:8.333333333333332%!important}.csi-col-sm-offset-2{margin-left:16.666666666666664%!important}.csi-col-sm-offset-3{margin-left:25%!important}.csi-col-sm-offset-4{margin-left:33.33333333333333%!important}.csi-col-sm-offset-5{margin-left:41.66666666666667%!important}.csi-col-sm-offset-6{margin-left:50%!important}.csi-col-sm-offset-7{margin-left:58.333333333333336%!important}.csi-col-sm-offset-8{margin-left:66.66666666666666%!important}.csi-col-sm-offset-9{margin-left:75%!important}.csi-col-sm-offset-10{margin-left:83.33333333333334%!important}.csi-col-sm-offset-11{margin-left:91.66666666666666%!important}}.csi-container,.csi-modal-container{margin-left:auto!important;margin-right:auto!important}.csi-container{padding-right:15px!important;padding-left:15px!important}.csi-icono{font-size:60px!important;color:#0086c3!important}.csi-texto-iconos{font-size:20px!important;color:#999!important}.csi-modal-mensaje{font-weight:400!important;line-height:normal!important;font-size:14px!important;color:#53575a!important;text-align:left!important}.csi-section{padding:5px 10px!important}.csi-footer{padding:19px 20px 20px 10px!important}.csi-separador{border-bottom-width:1px!important;border-bottom-style:solid!important;border-bottom-color:#e3e3e3!important}.csi-title{color:#005c84!important;font-size:30px!important;margin-top:initial!important}.csi-subtitle{font-size:24px!important;color:#005c84!important;text-align:left;border:none!important;font-weight:400!important;padding-left:0!important;margin-bottom:0!important}.csi-mas-tarde{font-size:18px!important;background-color:#005C84!important;color:#fff!important;border:none!important;height:36px!important;float:right!important}.csi-modal{padding-left:3%!important;padding-right:3%!important;position:absolute!important;top:0!important;left:0!important;background-color:rgba(0,0,0,.5)!important;width:100%!important;min-height:100%!important;z-index:999999!important;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#7f000000, endColorstr=#7f000000)}.csi-modal-container{background-color:#FFF!important;margin-top:5%!important;max-width:820px!important;font-size:14px!important;line-height:20px!important;color:#515559!important}.csi-close,.csi-close:focus,.csi-close:hover{float:right!important;font-size:20px!important;color:#005c84!important;text-decoration:none!important}.csi-modal-body{background:#fff!important;padding:10px!important}.csi-close:focus,.csi-close:hover{cursor:pointer!important;opacity:.8!important}button.csi-close{-webkit-appearance:none!important;padding:0!important;background:0 0!important;border:0!important}.csi-btn:focus,.csi-btn:hover{text-decoration:none!important}.csi-btn .span-text{margin-left:5px!important}.csi-btn{font:100 16px verdana!important;color:#fff!important;padding:5px 20px!important;border-radius:3px!important}</style><div class="csi-modal" id="csi-modal-inicial-bg" tabindex="-1" role="dialog" style="height: 4411px;"> <div class="csi-modal" id="csi-modal-inicial-bg" tabindex="-1" role="dialog" style="height: 4411px;"> <div class="csi-modal-container"> <div class="csi-modal-body"> <div class="csi-modal-mensaje" style="padding-bottom: 55px;"> <div class="csi-section csi-separador"> <div class="csi-row"> <div class="csi-col-xs-10"><span class="csi-title">Tu opinión nos importa</span></div><div class="csi-col-xs-2"><a class="csi-close csi-btn-close" onclick="encuestaCSI.cerrarModalInicial();" href="javascript:void(0);">X</a></div></div></div><div class="csi-section"> <div class="csi-row" style="margin-bottom: 20px;"> <div class="csi-col-xs-12" style="margin-bottom: 30px;"> <div class="csi-subtitle">¿Nos ayudas a mejorar?</div></div><div class="csi-col-xs-12 csi-col-sm-6"> <div class="icon-circular-tiempo csi-icono"></div><div style="padding-left: 80px;"><span class="csi-texto-iconos">Tan solo te pedimos 2 minutos de tu tiempo para rellenar esta pequeña encuesta.</span></div></div><div class="csi-col-xs-12 csi-visible-xs" style="height:30px"></div><div class="csi-col-xs-12 csi-col-sm-6"> <div class="icon-circular-pincha-aqui csi-icono"></div><div style="padding-left: 80px;"><span class="csi-texto-iconos">Cuando decidas completarla, pincha en el icono que estará minimizado abajo.</span></div></div></div></div><div class="csi-footer csi-separador"> <input class="csi-col-xs-12 csi-col-sm-3 csi-mas-tarde" value="MÁS TARDE" onclick="encuestaCSI.lanzarModalMinimizado(); return false;" type="button" style="margin-top: 36px;"> </div></div></div></div></div>',
		'facturaInteractiva': '<style>.csi-col-xs-1,.csi-col-xs-10,.csi-col-xs-11,.csi-col-xs-12,.csi-col-xs-2,.csi-col-xs-3,.csi-col-xs-4,.csi-col-xs-5,.csi-col-xs-6,.csi-col-xs-7,.csi-col-xs-8,.csi-col-xs-9,.csi-icono,.csi-title{float:left!important}.csi-mas-tarde,.csi-modal-container{font-family:TelefonicaLight!important}.csi-btn,.csi-mas-tarde,button.csi-close{cursor:pointer!important}a{text-decoration:none!important}.csi-margin0{margin:0!important}.csi-padding0{padding:0!important}.csi-center{display:table!important;margin:0 auto!important}.csi-z-index1{z-index:1!important}.csi-z-index2{z-index:2!important}.csi-z-index3{z-index:3!important}.csi-show{display:block!important}.csi-hide{display:none!important}.csi-row{margin-right:-15px!important;margin-left:-15px!important}.csi-row:after{clear:both!important}.csi-row:after,.csi-row:before{display:table!important;content:" "!important}*,:after,:before{-webkit-box-sizing:border-box!important;-moz-box-sizing:border-box!important;box-sizing:border-box!important}.csi-visible-xs,td.csi-visible-xs,th.csi-visible-xs,tr.csi-visible-xs{display:none!important}@media (max-width:767px){.csi-visible-xs{display:block!important}table.csi-visible-xs{display:table}tr.csi-visible-xs{display:table-row!important}td.csi-visible-xs,th.csi-visible-xs{display:table-cell!important}.csi-hidden-xs,td.csi-hidden-xs,th.csi-hidden-xs,tr.csi-hidden-xs{display:none!important}}.csi-col-lg-1,.csi-col-lg-10,.csi-col-lg-11,.csi-col-lg-12,.csi-col-lg-2,.csi-col-lg-3,.csi-col-lg-4,.csi-col-lg-5,.csi-col-lg-6,.csi-col-lg-7,.csi-col-lg-8,.csi-col-lg-9,.csi-col-md-1,.csi-col-md-10,.csi-col-md-11,.csi-col-md-12,.csi-col-md-2,.csi-col-md-3,.csi-col-md-4,.csi-col-md-5,.csi-col-md-6,.csi-col-md-7,.csi-col-md-8,.csi-col-md-9,.csi-col-sm-1,.csi-col-sm-10,.csi-col-sm-11,.csi-col-sm-12,.csi-col-sm-2,.csi-col-sm-3,.csi-col-sm-4,.csi-col-sm-5,.csi-col-sm-6,.csi-col-sm-7,.csi-col-sm-8,.csi-col-sm-9,.csi-col-xs-1,.csi-col-xs-10,.csi-col-xs-11,.csi-col-xs-12,.csi-col-xs-2,.csi-col-xs-3,.csi-col-xs-4,.csi-col-xs-5,.csi-col-xs-6,.csi-col-xs-7,.csi-col-xs-8,.csi-col-xs-9{position:relative!important;min-height:1px!important;padding-right:15px!important;padding-left:15px!important}.csi-col-xs-12{width:100%!important}.csi-col-xs-11{width:91.66666666666666%!important}.csi-col-xs-10{width:83.33333333333334%!important}.csi-col-xs-9{width:75%!important}.csi-col-xs-8{width:66.66666666666666%!important}.csi-col-xs-7{width:58.333333333333336%!important}.csi-col-xs-6{width:50%!important}.csi-col-xs-5{width:41.66666666666667%!important}.csi-col-xs-4{width:33.33333333333333%!important}.csi-col-xs-3{width:25%!important}.csi-col-xs-2{width:16.666666666666664%!important}.csi-col-xs-1{width:8.333333333333332%!important}.csi-col-xs-offset-12{margin-left:100%!important}.csi-col-xs-offset-11{margin-left:91.66666666666666%!important}.csi-col-xs-offset-10{margin-left:83.33333333333334%!important}.csi-col-xs-offset-9{margin-left:75%!important}.csi-col-xs-offset-8{margin-left:66.66666666666666%!important}.csi-col-xs-offset-7{margin-left:58.333333333333336%!important}.csi-col-xs-offset-6{margin-left:50%!important}.csi-col-xs-offset-5{margin-left:41.66666666666667%!important}.csi-col-xs-offset-4{margin-left:33.33333333333333%!important}.csi-col-xs-offset-3{margin-left:25%!important}.csi-col-xs-offset-2{margin-left:16.666666666666664%!important}.csi-col-xs-offset-1{margin-left:8.333333333333332%!important}.csi-col-xs-offset-0{margin-left:0!important}@media (min-width:768px){.csi-col-sm-1,.csi-col-sm-10,.csi-col-sm-11,.csi-col-sm-12,.csi-col-sm-2,.csi-col-sm-3,.csi-col-sm-4,.csi-col-sm-5,.csi-col-sm-6,.csi-col-sm-7,.csi-col-sm-8,.csi-col-sm-9{float:left!important}.csi-col-sm-1{width:8.333333333333332%!important}.csi-col-sm-2{width:16.666666666666664%!important}.csi-col-sm-3{width:25%!important}.csi-col-sm-4{width:33.33333333333333%!important}.csi-col-sm-5{width:41.66666666666667%!important}.csi-col-sm-6{width:50%!important}.csi-col-sm-7{width:58.333333333333336%!important}.csi-col-sm-8{width:66.66666666666666%!important}.csi-col-sm-9{width:75%!important}.csi-col-sm-10{width:83.33333333333334%!important}.csi-col-sm-11{width:91.66666666666666%!important}.csi-col-sm-12{width:100%!important}.csi-col-sm-offset-0{margin-left:0!important}.csi-col-sm-offset-1{margin-left:8.333333333333332%!important}.csi-col-sm-offset-2{margin-left:16.666666666666664%!important}.csi-col-sm-offset-3{margin-left:25%!important}.csi-col-sm-offset-4{margin-left:33.33333333333333%!important}.csi-col-sm-offset-5{margin-left:41.66666666666667%!important}.csi-col-sm-offset-6{margin-left:50%!important}.csi-col-sm-offset-7{margin-left:58.333333333333336%!important}.csi-col-sm-offset-8{margin-left:66.66666666666666%!important}.csi-col-sm-offset-9{margin-left:75%!important}.csi-col-sm-offset-10{margin-left:83.33333333333334%!important}.csi-col-sm-offset-11{margin-left:91.66666666666666%!important}}.csi-container,.csi-modal-container{margin-left:auto!important;margin-right:auto!important}.csi-container{padding-right:15px!important;padding-left:15px!important}.csi-icono{font-size:60px!important;color:#0086c3!important}.csi-texto-iconos{font-size:20px!important;color:#999!important}.csi-modal-mensaje{font-weight:400!important;line-height:normal!important;font-size:14px!important;color:#53575a!important;text-align:left!important}.csi-section{padding:5px 10px!important}.csi-footer{padding:19px 20px 20px 10px!important}.csi-separador{border-bottom-width:1px!important;border-bottom-style:solid!important;border-bottom-color:#e3e3e3!important}.csi-title{color:#005c84!important;font-size:30px!important;margin-top:initial!important}.csi-subtitle{font-size:24px!important;color:#005c84!important;text-align:left;border:none!important;font-weight:400!important;padding-left:0!important;margin-bottom:0!important}.csi-mas-tarde{font-size:18px!important;background-color:#005C84!important;color:#fff!important;border:none!important;height:36px!important;float:right!important}.csi-modal{padding-left:3%!important;padding-right:3%!important;position:absolute!important;top:0!important;left:0!important;background-color:rgba(0,0,0,.5)!important;width:100%!important;min-height:100%!important;z-index:999999!important;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#7f000000, endColorstr=#7f000000)}.csi-modal-container{background-color:#FFF!important;margin-top:5%!important;max-width:820px!important;font-size:14px!important;line-height:20px!important;color:#515559!important}.csi-close,.csi-close:focus,.csi-close:hover{float:right!important;font-size:20px!important;color:#005c84!important;text-decoration:none!important}.csi-modal-body{background:#fff!important;padding:10px!important}.csi-close:focus,.csi-close:hover{cursor:pointer!important;opacity:.8!important}button.csi-close{-webkit-appearance:none!important;padding:0!important;background:0 0!important;border:0!important}.csi-btn:focus,.csi-btn:hover{text-decoration:none!important}.csi-btn .span-text{margin-left:5px!important}.csi-btn{font:100 16px verdana!important;color:#fff!important;padding:5px 20px!important;border-radius:3px!important}</style><div class="csi-modal" id="csi-modal-inicial-bg" tabindex="-1" role="dialog" style="height: 4411px;"><div class="csi-modal-container"><div class="csi-modal-body"><div class="csi-modal-mensaje"><div class="csi-section csi-separador"><div class="csi-row"><div class="csi-col-xs-10"><span class="csi-title">Tu opinión nos importa</span></div><div class="csi-col-xs-2"><a class="csi-close csi-btn-close" onclick="encuestaCSI.cerrarModalInicial();" href="javascript:void(0);">X</a></div></div></div><div class="csi-section csi-separador"><div class="csi-row" style="margin-bottom:50px;"><div class="csi-col-xs-12" style="margin-bottom: 30px;"><div class="csi-subtitle">¿Nos ayudas a mejorar?</div></div><div class="csi-col-xs-12 csi-col-sm-6"> <div class="icon-circular-tiempo csi-icono"></div><div style="padding-left: 80px;"><span class="csi-texto-iconos">Tan solo te pedimos 2 minutos de tu tiempo para rellenar esta pequeña encuesta.</span></div></div><div class="csi-col-xs-12 csi-visible-xs" style="height:30px"></div><div class="csi-col-xs-12 csi-col-sm-6"><div class="icon-circular-pincha-aqui csi-icono"></div><div style="padding-left: 80px;"><span class="csi-texto-iconos">Pincha en el botón inferior para iniciar la encuesta.</span></div></div></div></div><div class="csi-section"><div class="csi-row"><div class="csi-footer"><input class="csi-col-xs-12 csi-col-sm-3 csi-mas-tarde" value="RELLENAR AHORA" onclick="encuestaCSI.lanzarModalEncuesta(); return false;" type="button"></div></div></div></div></div></div></div>'
	};
	
	var modalMinimizadoHTM = '<div id="encuestaCSImin"><div style="bottom: 88px;right: 2px;position: fixed;padding: 0 10px 0 0px;color: #5cd2ed;font-size: 22px;float: left;"><a style="text-decoration: none;" onclick="encuestaCSI.cerrarModalMinimizado();" href="javascript:;">X</a></div><a style="text-decoration: none;" onclick="encuestaCSI.lanzarModalEncuesta();" href="javascript:;"><div style="z-index: 999999999999; width: 200px;height: 90px;position: fixed;bottom: 0;right:0;font-family:TelefonicaLight;float:left;text-align: center !important;"><div style="width: 45%;height: 100px;background-color: white!important;border: 1px #7ab800 solid;float: left;color: black;padding: 30px 2px 0px 2px;font-size: 13px;">TU OPINIÓN<br>NOS IMPORTA</div><div class="icon-circular-pincha-aqui" style="width: 50%;height: 100px;float: left;padding: 18px 2px 0px 2px;background-color: #7ab800;color: white;font-size: 60px;"></div></div></a></div>';
	
	/**
	 * Urls de producción de las distintas encuestas
	 */
	var urls = {
		'empresas' 			: '//www.movistar.es/atcliente/e/COL_Empresas_WEB/scripts/ModalCOL_Empresas_WEB_Pro.js',
		'particulares'		: '//www.movistar.es/atcliente/e/COL_Navegacion/scripts/ModalCOL_Pro.js', 
		'canalPremium'		: '//www.movistar.es/atcliente/e/COL_Empresas_CPRE/scripts/ModalCOL_Empresas_CPRE_Pro.js', 
		'aplicateca'		: '//www.movistar.es/Aplicaciones/encuesta-aplicateca',
		"comunidad"			: '//www.movistar.es/atcliente/e/COL_Navegacion/scripts/ModalCOL_Pro.js',
		"facturaInteractiva": '//www.movistar.es/atcliente/e/COL_Factura/scripts/ModalCOL_Factura_Pro.js'
	};
	
	//PARTE PÚBLICA
	
	//MÉTODOS PÚBLICOS
	
	/**
	 * Lanza el modal de la encuesta para cualquier segmento. 
	 */
	this.lanzarModalEncuesta = function(){
		try{
			//Depuracion
			if(csiDebug && csiDebug.isOn()){
				console.log("Lanzar modal encuesta");
			}
			
			if(isIE8orPrior() || isInIframe()) return false;;
					
			var modal_width = 720;
			var modal_height = 500;
			var urlEncuesta= urls[segmento];

			//Oculta Modal Inicial si se está mostrando (caso Factura Interactiva)
			$('#csi-modal-inicial-bg').remove();
			
			//Cookies
			//Actualizar cookie última
			setCookieValue(idCookieUltima, (new Date()).getTime(), expCookie);
			//Actualizar cookie de minimizada (cookie de sesión: no se carga modal minimizado si se cierra navegador)
			setCookieValue(idCookieMinimizada, false);
			//Actualizar cookie de determinación de dispositivo (mobile/desktop)
			setCookieValue(idCookieEsMobile, esMobile(), expCookie);
			
			//Lanzamiento aplicateca
			if(segmento == 'aplicateca'){
				abrirEncuestaCsi(modal_width, modal_height, 'Encuesta de satisfacción', urlEncuesta);
			}
			
			//Comportamiento genérico
			else {
				//Lanzamiento en cualquier otro segmento
				//JQuery cargar script encuesta TCRM
				$.getScript(urlEncuesta, function(data, textStatus, jqxhr){
					//Depuración del getScript (status <> Success)
					if(jqxhr.status != 200){
						if (csiDebug)
							csiDebug.sendError({
							name: "(critico)(ejecucion)",
							code: "EncuestaCSI.lanzarModalEncuesta.getScript",
							message: "Segmento: " + segmento + " Error loading JS -> " + textStatus + " - " + jqxhr.status
						});
					}
					
				});
			}
			
				
			//Actualizar elementos
			$("#encuestaCSImin").remove();
			
			//Flags de modales
			modalFlags['modalMinimizado'] = false;
			modalFlags['modalEncuesta'] = true;
			
			//Enviar a Analytics evento de lanzamiento de encuesta e ID único de encuesta
			includeTagger();
			TG.setTaggerDimension(101,getCookieValue(idCookieUltima));
			TG.setTaggerEvent("CSI", "Encuesta CSI", "ModalEncuesta: " + segmento, "Visualizada", null, null, [11,50,101]).execute();

			//Ejecuta lanzamiento funciones asociadas al cambio de estado
			setStatus("modalEncuestaLanzado");

			return true;
			
			}catch(error){
				if (csiDebug)
					csiDebug.sendError({
					name: "(critico)(JavaScript)(ejecucion)",
					code: "EncuestaCSI.lanzarModalEncuesta",
					message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
					error: error
				});
			}
	};
	
	/**
	 * Cierra el modal de la encuesta
	 */
	this.cerrarModalEncuesta = function(){
		try{
			//Depuracion
			if(csiDebug && csiDebug.isOn()){
				console.log("Cerrar Modal Encuesta");
			}
			
			//Actualizar cookies
			setCookieValue(idCookieUltima, (new Date()).getTime(), expCookie);
					
			//Flags de modales
			modalFlags['modalEncuesta'] = false;
			
			//Enviar a Analytics
			includeTagger();
			TG.setTaggerEvent("CSI", "Encuesta CSI", "ModalEncuesta: " + segmento, "Cerrada", null, null, [11,50]).execute();

			//Ejecuta lanzamiento funciones asociadas al cambio de estado
			setStatus("modalEncuestaCerrado");
			
			return true;
			
		}catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(critico)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.cerrarModalEncuesta",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
	};
	
	
	/**
	 * Lanza el modal inicial
	 */
	this.lanzarModalInicial = function(){
		try{
			//Depuracion
			if(csiDebug && csiDebug.isOn()){
				console.log("Visualizar Modal Inicial");
			}
			
			if(isIE8orPrior() || isInIframe()) return false;
			
			var iframe = modalInicialHTM[segmento];

			//SOLO para FACTURA INTERACTIVA: se lanza el modal de la encuesta tras 0 clics, 
			//pero antes se espera 60 segundos. Hasta que no se lanza, no actualiza cookies.
			if (segmento=="facturaInteractiva"){
				setTimeout(function(){
				 $('body').append(iframe); 
				//Actualizar cookies
				setCookieValue(idCookieUltima, (new Date()).getTime(), expCookie);
				setCookieValue(idCookieClicks, 0, expCookie);
				//Actualizar cookie URL
				setCookieValue(idCookieURLInicio, window.location.pathname, expCookie);
				//Actualizar cookie page name
				var valorPageName = '';
					try{
						valorPageName = (typeof s.pageName == 'string') ? s.pageName : '';
					}catch(error){
						valorPageName = 'no definido';
					}
				setCookieValue(idCookiePageNameInicio, valorPageName, expCookie);
				//Reiniciar contador de clics acumulados
				n_clicks_acum=0;
				//Flags de modales
				modalFlags['modalInicial'] = true;
				
				//Enviar a Analytics
				includeTagger();
				TG.setTaggerEvent("CSI", "Encuesta CSI", "ModalInicial: " + "facturaInteractiva", "Visualizada", null, null, [11,50]).execute();
				
				return true;
				}, 60000);
			}

			//CUALQUIER OTRO SEGMENTO
			else{
			//Lanza Modal Inicial
			$('body').append(iframe);		
	
			//Actualizar cookies
			setCookieValue(idCookieUltima, (new Date()).getTime(), expCookie);
			setCookieValue(idCookieClicks, 0, expCookie);
			//Actualizar cookie URL
			setCookieValue(idCookieURLInicio, window.location.pathname, expCookie);
			//Actualizar cookie page name
			var valorPageName = '';
				try{
					valorPageName = (typeof s.pageName == 'string') ? s.pageName : '';
				}catch(error){
					valorPageName = 'no definido';
				}
			setCookieValue(idCookiePageNameInicio, valorPageName, expCookie);
			
			//Reiniciar contador de clics acumulados
			n_clicks_acum=0;
			
			//Flags de modales
			modalFlags['modalInicial'] = true;
		
			
			//Enviar a Analytics
			includeTagger();
			TG.setTaggerEvent("CSI", "Encuesta CSI", "ModalInicial: " + segmento, "Visualizada", null, null, [11,50]).execute();


			//Ejecuta lanzamiento funciones asociadas al cambio de estado
			setStatus("modalInicialLanzado");

			return true;
			}
		}
		catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(critico)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.lanzarModalInicial",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
	};
	
	
	/**
	 * Cierra el modal de inicio
	 */
	this.cerrarModalInicial = function(){
		try{
			//Depuracion
			if(csiDebug && csiDebug.isOn()){
				console.log("Cerrar Modal Inicial");
			}
			
			//Cierra Modal Inicial
			$('#csi-modal-inicial-bg').remove();
			
			//Actualizar cookies
			setCookieValue(idCookieUltima, (new Date()).getTime(), expCookie);
			
			//Flags de modales
			modalFlags['modalInicial'] = false;
			
			//Enviar a Analytics
			includeTagger();
			TG.setTaggerEvent("CSI", "Encuesta CSI", "ModalInicial: " + segmento, "Cerrada", null, null, [11,50]).execute();

			//Ejecuta lanzamiento funciones asociadas al cambio de estado
			setStatus("modalInicialCerrado");
				
			return true;
			
		}catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(critico)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.cerrarModalInicial",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
	};
	
	
	/**
	 * Lanza el modal minimizado
	 */
	this.lanzarModalMinimizado = function(){
		try{	
			if(isIE8orPrior() || isInIframe()) return false;
			
			//Borrar anterior
			$("#encuestaCSImin").remove();
			
			//Oculta Modal Inicial si se está mostrando
			$('#csi-modal-inicial-bg').remove();
				
			//Actualizar cookie de minimizada (cookie de sesión: no se carga modal minimizado si se cierra navegador)
			setCookieValue(idCookieMinimizada, true);
			
			var clicsEsperadosMinimizado = (configs[segmento]["modalMinimizado"]) ? (configs[segmento]["modalMinimizado"].clics) : null; 
			
			//Si hay alguna configuración de clics definida y además esa config aún no se cumple, devuelve False y no se muestra
			if((clicsEsperadosMinimizado != null) && (n_clicks_acum < clicsEsperadosMinimizado) )
				return false;
			
			//Depuracion
			if(csiDebug && csiDebug.isOn()){
				console.log("Visualizar Modal Minimizado");
			}
			
			//Lanza Modal Minimizado		
			$("body").append(modalMinimizadoHTM);
			
			//Actualizar cookies
			setCookieValue(idCookieUltima, (new Date()).getTime(), expCookie);
			
			//Flags de modales
			modalFlags['modalInicial'] = false;
			modalFlags['modalMinimizado'] = true;
			
			//Enviar a Analytics
			includeTagger();
			TG.setTaggerEvent("CSI", "Encuesta CSI", "ModalMinimizado: " + segmento, "Visualizada", null, null, [11,50]).execute();

			//Ejecuta lanzamiento funciones asociadas al cambio de estado
			setStatus("modalMinimizadoLanzado");
			
			return true;
		}
		catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(critico)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.lanzarModalMinimizado",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
	};
	
	
	/**
	 * Cierra el modal minimizado
	 */
	this.cerrarModalMinimizado = function(){
		try{
			//Depuracion
			if(csiDebug && csiDebug.isOn()){
				console.log("Cerrar Modal Minimizado");
			}
			
			//Cierra Modal Minimizado
			$("#encuestaCSImin").remove();
			
			//Actualizar cookies
			setCookieValue(idCookieUltima, (new Date()).getTime(), expCookie);
			
			//Actualizar cookie de minimizada (cookie de sesión: no se carga modal minimizado si se cierra navegador)
			setCookieValue(idCookieMinimizada, false);
			
			//Flags de modales
			modalFlags['modalMinimizado'] = false;
			
			//Enviar a Analytics
			includeTagger();
			TG.setTaggerEvent("CSI", "Encuesta CSI", "ModalMinimizado: " + segmento, "Cerrada", null, null, [11,50]).execute();

			//Ejecuta lanzamiento funciones asociadas al cambio de estado
			setStatus("modalMinimizadoCerrado");
			
			return true;
			
		}catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(critico)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.cerrarModalMinimizado",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
	};
	
	/**
	 * <<Método para test>> Lanza la encuesta de TCRM para el segmento pasado como parámetro
	 * @param segmento String con el segmento de la encuesta de TCRM. Si no se pasa segmento, se carga por defecto encuesta de Particulares.
	   Posibles valores: [particulares | empresas | canalPremium | facturaInteractiva]
	 * @param debug Si true, se carga el javascript de depuración de TCRM, en cualquier otro caso, se carga el script de producción.  
	*/		
	this.lanzarEncuestaTCRM = function(segmento, debug){
		try{
			//default : encuesta de particulares
			var prodScriptURL = "//www.movistar.es/atcliente/e/COL_Navegacion/scripts/ModalCOL_Pro.js";
			var devScriptURL = "//www.movistar.es/atcliente/e/COL_Navegacion/scripts/ModalCOL_Debug.js";
			
			switch(segmento) {
			    case "empresas":
					prodScriptURL = "//www.movistar.es/atcliente/e/COL_Empresas_WEB/scripts/ModalCOL_Empresas_WEB_Pro.js";
					devScriptURL = "//www.movistar.es/atcliente/e/COL_Empresas_WEB/scripts/ModalCOL_Empresas_WEB_Debug.js";
			        break;
			    case "canalPremium":
			        prodScriptURL = "//www.movistar.es/atcliente/e/COL_Empresas_CPRE/scripts/ModalCOL_Empresas_CPRE_Pro.js";
					devScriptURL = "//www.movistar.es/atcliente/e/COL_Empresas_CPRE/scripts/ModalCOL_Empresas_CPRE_Debug.js";
			        break;
			    case "facturaInteractiva":
					prodScriptURL = "//www.movistar.es/atcliente/e/COL_Factura/scripts/ModalCOL_Factura_Pro.js";
					devScriptURL = "//www.movistar.es/atcliente/e/COL_Factura/scripts/ModalCOL_Factura_Debug.js";
			        break;
			    default:
			    	//encuesta particulares	
			}
				
			//Inicializa variable
			var finalUrl = "";
			//Si existe el parámetro debug y se pasa con valor True, se llama a encuesta de depuración
			if(debug && debug == true)
				finalUrl = devScriptURL;
			else
				//Default: Si no se pasa parámetro debug o llega con valor False, se llama a encuesta de producción	
				finalUrl = prodScriptURL;
			
			//Actualizar cookie última
			setCookieValue(idCookieUltima, (new Date()).getTime(), expCookie);
			//Actualizar cookie de determinación de dispositivo (mobile/desktop)
			setCookieValue(idCookieEsMobile, esMobile(), expCookie);
			
			//JQuery cargar script encuesta TCRM
			$.getScript(finalUrl, function(data, textStatus, jqxhr){
				//Depuración del getScript (status <> Success)
				if(jqxhr.status != 200){
					if (csiDebug)
						csiDebug.sendError({
						name: "(critico)(ejecucion)",
						code: "EncuestaCSI.lanzarEncuestaTCRM.getScript",
						message: "Segmento: " + segmento + " Error loading JS -> " + textStatus + " - " + jqxhr.status
					});
				}
				
			});
		}catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(critico)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.lanzarEncuestaTCRM",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
	};
	
	
	/**
	 * Establece las cookies de forma que se considera que la encuesta se rellena y se finaliza
	 * 
	 * @param nota La nota de la encuesta
	 * @parma tagging determina si enviar a analytics la informacion o no.
	 * 
	 */
	this.finalizarEncuesta = function(nota, tagging){
		//Depuracion
		if(csiDebug && csiDebug.isOn()){
			console.log("Encuesta enviada - " + segmento +" - Nota: " + (nota.toString()));
		}
		//Enviar nota a analytics
		if(typeof TG != 'undefined' && tagging!=false){
			try{
				includeTagger();
				TG.setTaggerEvent("CSI", "Encuesta CSI", "ModalEncuesta: " + segmento, "Enviada - " + nota, null, null, [11,50]).execute();
				
			}catch(error){
				if(csiDebug) csiDebug.sendError({
					name: "(informativo)(JavaScript)(ejecucion)",
					code: "EncuestaCSI.finalizarEncuesta",
					message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
					error: error
				});
			}
		}
	};
	
	/**
	 * Inicializa la depuración tanto de la lógica de lanzamiento como de la propia encuesta
	 */
	this.startDebug = function(){
		
		if(csiDebug) csiDebug.start();
			(new MovistarDebug("CSI-I-ERROR","InternalCSI")).start();
		//Usamos rutas relativas para particulares y empresas, para poder probar la encuesta en pre
		urls["particulares"] = urls["particulares"].replace("//www.movistar.es","");
		urls["empresas"] = urls["empresas"].replace("//www.movistar.es","");
	};

	/**
	 * Detiene la depuración tanto de la lógica de lanzamiento como de la propia encuesta
	 */
	this.stopDebug = function(){
		
		if(csiDebug) csiDebug.stop();
		(new MovistarDebug("CSI-I-ERROR","InternalCSI")).stop();
	};
	
	/**
	 * Añade una funcion de exclusión
	 * 
	 * @param func:function, debe ser una función que devuelva true si se debe excluir
	 */
	this.addExclusion = function(func){
		
		if(typeof func == "function"){
			v_exclusiones.push(func);
		}
	};
	
	/**
	 * Añade una funcion de obligacion
	 * 
	 * @param func:function, debe ser una función que devuelva true si se debe obligar
	 */
	this.addObligacion = function(func){
		
		if(typeof func == "function"){
			v_obligaciones.push(func);
		}
	};
	
	/**
	 * Determina si la encuesta se encuentra excluida en el contexto actual
	 */
	this.isExcluida = function(){
		try{
			//Se ejecuta solo si el objeto s está definido
			if (typeof s != "undefined"){
				for(var i=0; i<v_exclusiones.length; i++){
					if((typeof v_exclusiones[i] == "function") && v_exclusiones[i]()){
						//Enviar a Analytics
						includeTagger();
						TG.setTaggerEvent("CSI", "Encuesta CSI", "Pagina excluida - "+segmento, window.location.pathname, null, null, [11,50]).execute();
						return true;
					}
				}
				//Devuelve false si no se activa ninguna regla de exclusión del vector
				return false;
			}
		}catch(error){
				if (csiDebug) 
					csiDebug.sendError({
					name: "(informativo)(JavaScript)(ejecucion)",
					code: "EncuestaCSI.isExcluida",
					message: "Se considera excluido. Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
					error: error
				});
				//Se considera excluido si hay un error
				return true;
			}
	};
	
	/**
	 * Determina si la encuentra se lanza de forma obligatoria en el contexto actual.
	 */
	this.isObligada = function(){
		try{
			//Se ejecuta solo si el objeto s está definido
			if (typeof s != "undefined"){
				for(var i=0; i<v_obligaciones.length; i++){
					
					if((typeof v_obligaciones[i] == "function") && v_obligaciones[i]())
						return true;
				}
				//Devuelve false si no se activa ninguna regla de obligación del vector
				return false;
			}
		}catch(error){
			if (csiDebug) 
				csiDebug.sendError({
				name: "(informativo)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.isObligada",
				message: "Se considerará no obligada. Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
			//Se considera NO obligada si hay un error
			return false;
		}
	};
	
	/**
	 * Finalización de la encuesta. Recibe información externa para determinar la causa de la finalización y envía información a TCRM
	 */
	this.callback = function(data){
		try{
			if (csiDebug && csiDebug.isOn())
				console.debug(data);
			//Encuesta finalizada
			if (data.action == "enviada")
				this.finalizarEncuesta(data.nota,true);
			//Encuesta cerrada
			else if (data.action == "cerrar")
				this.cerrarModalEncuesta();
			//Error en variable data, se envía a Analytics
			else if (csiDebug)
					csiDebug.sendError({
					name: "(informativo)(integridad)(ejecucion)",
					code: "EncuestaCSI.callback",
					message: "Segmento: " + segmento + ". Acción no contemplada -> "+ data.action,
					error: error
				});
		}
		catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(critico)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.callback",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
	};

	/**
	 * Vuelve a ejecutar el método privado ejecutar() para reevaluar las condiciones de la encuesta
	 */
	this.reevaluar = function(){
		ejecutar();
	};

	/**
	 * Devuelve estado de la ventana modal pasada como parámetro
	 * @param modal. String con el nombre de la ventana modal {"inicial", "minimizado", "encuesta"}
	*/ 
	this.getModalFlag = function(modal){
		try{
			switch(modal) {
				case "modalInicial":
					return modalFlags['modalInicial'];
					break;
				case "modalMinimizado":
					return modalFlags['modalMinimizado'];
					break;
				case "modalEncuesta":
					return modalFlags['modalEncuesta'];
					break;
				default:
					return false;
			}
		}
		catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(critico)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.getModalFlag",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
	};



	/*
	* Método privado que dispara las funciones almacenadas en el array
	*/
	var triggerSuscription = function(){
		//Ejecuta la acción del suscriptor si está definida la función
		for(var i=0; i<listeners.length; i++) {
			if (typeof listeners[i] == "function"){
				try{
					listeners[i](status,this_csi);	
				}catch(e){}
			}
		}
	};

	/**
	 * Método público de suscripción genérica a eventos
	 * Si existe la función "func", asigna a la variable de callback su valor.
	 */
	this.onStateCsiChange = function(func){
		//Carga suscriptor en el objeto
		if((typeof func != 'function'))
			return false
		//Almacena función en el array
		listeners.push(func);
	};


	/**
	 * Método público para establecer versión de la encuesta CSI
	 */
	this.setVersion = function(v){
		version = v;
	};

	/**
	 * Método público para obetener la versión de la encuesta CSI
	 */
	this.getVersion = function(){
		return version;
	};

	/**
	 * Método público para obetener el array de estados posibles
	 */
	this.getOwner = function(){
		return owner;
	};

	/**
	 * Método público para obetener el array de estados posibles
	 */
	this.getService = function(){
		return service;
	};

		/**
	 * Establece el valor de la variable status y lanza funciones asociadas a el estado recibido como parámetro
	 * @param new_status. Estado actual del modal de la encuestas CSI
	*/ 
	var setStatus = function(new_status){
		status = new_status;
		triggerSuscription();
	}
	
	/**
	 * Devuelve valor de la variable status
	*/ 
	this.getStatus = function(){
		return status;
	}

	/**
	* Devuelve array de posibles estados
	*/ 
	this.getStatusSet = function(){
		return statusSet;
	}
	

	//PARTE PRIVADA

	//MÉTODOS PRIVADOS

	/**
	 * Devuelve true si es IE8 o inferior
	 */
	var isIE8orPrior = function(){
		
		if (/MSIE\s([\d.]+)/.test(navigator.userAgent)){
	    //Get the IE version.  This will be 6 for IE6, 7 for IE7, etc...
	    	if(parseInt(RegExp.$1) <= 8)
	    		return true;
		}
		return false;
	};
	
	//Segmentos comunes: tratamos los segmentos "particulares" y "comunidad" como "particulares"
	var actualizarCookieIds = function(){
		idCookieClicks += "_" + ((segmento == "comunidad") ? "particulares" : segmento);
		idCookieUltima += "_" + ((segmento == "comunidad") ? "particulares" : segmento);
		idCookieMinimizada += "_" + ((segmento == "comunidad") ? "particulares" : segmento);
		idCookieURLInicio += "_" + ((segmento == "comunidad") ? "particulares" : segmento);
		idCookiePageNameInicio += "_" + ((segmento == "comunidad") ? "particulares" : segmento);
	};
	
	/**
	 * Determina si el ámbito de la encuesta es mobile o desktop. Devuelve true si es mobile, false si es desktop
	 */	
	var esMobile = function(){
		try{
			if(screen.width<640)
				//mobile
				return true;
			else
				//desktop
				return false;
		}catch(error){}
	};
	
	/**
	 * Actualiza la variable n_clicks_acum y actualiza la cookie con el valor anterior +1
	 */
	var actualizarClics = function(){
		
		n_clicks_acum = parseInt( getCookieValue(idCookieClicks) );
		n_clicks_acum = (n_clicks_acum) ? (n_clicks_acum+1) : 1;
		// Cookie de sesión. El nº de clics se resetea cada vez que se cierra el navegador
		setCookieValue(idCookieClicks, n_clicks_acum);
	};

	/**
	 * Determina si el usuario que se encuentra en el segmento ha interactuado en los últimos n días con la encuesta de
	 * un segmento. Devuelve True si ha habido interacción en los últimos n días. En caso contrario, False.
	 * @param segmento. String con el nombre del segmento
	 * @param dias. Integer con el valor en días
	 */
	var otraEncuestaLanzada= function(segmento, dias){
		var cookie = "CSI_ultima_"+segmento;
		var validez = dias * 86400000;
		var actual = (new Date()).getTime();
		//Si existe cookie de interacción con encuesta del segmento Y 
		//aun no han pasado dias desde la interacción con encuesta, devuelve True
		if ( (typeof(getCookieValue(cookie)) == "string") && (actual - parseFloat(getCookieValue(cookie)) < validez) )
				return true;
		else return false;
	};
	
	/**
	 * Determina el modal que se debe de lanzar. 
	 * Si se cumplen las reglas necesarias para que algún modal se lance, este método además lo lanzará
	 * 
	 */
	var ejecutar = function(){
		
		if(isIE8orPrior() || isInIframe()) 
			return false;
		
		//Variables
		var ultima = parseFloat(getCookieValue(idCookieUltima));
		var validez = configs[segmento].validez * 86400000;
		var actual = (new Date()).getTime();
		var clicsEsperados = configs[segmento]["modalInicial"].clics;
		var probabilidad = configs[segmento]["modalInicial"].probabilidad;
		
		//Reglas de exclusión
		if(this_csi.isExcluida())
			return false;

		//Si minimizada
		if(getCookieValue(idCookieMinimizada) == "true")
			return this_csi.lanzarModalMinimizado();

		/**Análisis de cookies de encuesta**/

		//Si segmento actual = Particulares Y aun no han pasado 10 días desde la interacción con encuesta de FI, no se lanza
		if ((segmento == "particulares") && otraEncuestaLanzada("facturaInteractiva",10))
			return false;
		//Si segmento actual = FI Y aun no han pasado 10 días desde la interacción con encuesta de Particulares, no se lanza
		else if ((segmento == "facturaInteractiva") && otraEncuestaLanzada("particulares",10))
			return false;
		//Caso genérico (mismo segmento): si aún no han pasado config[segmento].validez días, no se lanza
		else if (actual - ultima < validez)
			return false;

		//Reglas de obligación
		if(this_csi.isObligada()){
			setTimeout(function(){
				return this_csi.lanzarModalEncuesta();
			}, delayObligaciones);	
			return true;
		}

		if(n_clicks_acum > clicsEsperados && ((Math.random() * 100) <= probabilidad) )
			// Para aplicateca, se lanza directamente la encuesta
			if (segmento == "aplicateca")
				return this_csi.lanzarModalEncuesta();
			//para el resto de segmentos, se lanza el modal inicial
			else 
				return this_csi.lanzarModalInicial();
		
		return false;
	};
	
	/**
	 * Determina el ámbito actual (segmento)
	 */	
	var determinaSegmento = function(){
		
		segmento = null;
		
		try{	
			var host = window.location.host;
			
			//Aplicateca
			if(host.indexOf('aplicateca.es')>=0  || host.indexOf('aplicatecapre.nec-saas.com')>=0)
				return "aplicateca";
			
			//Comunidad
			if(host == "comunidad.movistar.es" || host == "comunidad-stage.movistar.es")
				return "comunidad";
			
			//Importante: Se trata Atención al Cliente como Particulares
			if(host == "atencionalcliente.movistar.es")
				return "particulares";
			
			//Canal Premium
			if(host == "www.canalpremium.telefonica.es" || host == "cpreadmmgmt.tsm.inet" || host == "canalpremium.tsm.inet")
				return "canalPremium";
			
			//Tratamiento variables
			var infoSegmento = (typeof userInfoSegmento == 'string')? userInfoSegmento : '';
			var infoSegmentoNav = (typeof userInfoSegmentoNav == 'string')? userInfoSegmentoNav : '';
			var infoLogado = (typeof userInfoLogado == 'string') ? userInfoLogado : '';
			
			var vPathname = "";
			try{
				vPathname = (typeof window.top.location.pathname == 'string') ?  window.top.location.pathname : '';
			}catch(error){
				vPathname = (typeof window.location.pathname == 'string') ?  window.location.pathname : '';
			}

			var vHref = "";
			try{
				vHref = (typeof window.top.location.href == 'string') ?  window.top.location.href : '';
			}catch(error){
				vHref = (typeof window.location.href == 'string') ?  window.location.href : '';
			}

			//Factura interactiva (se comprueba primero caso Fusión, después caso solo fijo)
			if ((vPathname.indexOf('/miMovistar/C_IframeMenu')>=0) && (vHref.indexOf('verFactura_Interactiva')>=0) || (vHref.indexOf('residencial_v3.jsp')>=0))
					return "facturaInteractiva";
			
			if(	//Usuario logado como particular o autonomo
				(infoLogado == "S" && (infoSegmento == "GP" || infoSegmento == "AU")) || 
				
				//Usuario navegando en el segmento de particulares o autonomos
				(infoSegmentoNav == "APRO" || infoSegmentoNav == "AHOG" || infoSegmentoNav == "CPRO" || infoSegmentoNav == "CHOG" ) || 
				
				//URL contiene particulares o autonomos
				(vPathname.indexOf('particulares')>=0 || vPathname.indexOf('autonomos')>=0) )
				
				return "particulares";
			
			
			if(	//Usuario logado como empresa
				(infoLogado == "S" && (infoSegmento == "GC" || infoSegmento == "PE" || infoSegmento == "ME")) || 
				
				//Usuario navegando en el segmento de empresas 
				(infoSegmentoNav == "EMPR" || infoSegmentoNav == "GCLI") ||

				//URL contiene empresas o GGCC
				(vPathname.indexOf('empresas')>=0 || vPathname.indexOf('GGCC')>=0) ||
				
				//Por cookie
				(getCookieValue("SEG_NAV")=='empresas' || getCookieValue("SEG_NAV")=='grandes-empresas' ))
				
				return "empresas";
			
		
		}catch(error){
					
			if (csiDebug)
				csiDebug.sendError({
				name: "(informativo)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.determinaSegmento",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
		
		//Frente a contingencias
		return 'particulares';
	};
	
	/**
	 * Determina si está en un iframe
	 */
	var isInIframe = function(){
		return (window.location != window.parent.location) ? true : false;
	};
	
	
	/**
	 * Estalece el valor de una cookie
	 */
	var setCookieValue = function(c_name,value,exdays){
		
		var domain = "";
		//Dominio padre
		try{
			//Si existe un iframe, guarda el domain de la pag en 2º plano (top)
			var parts = top.location.hostname.split('.');
			domain = parts.slice(-2).join('.');
		}
		//Dominio actual
		catch (error){
			//En caso contrario, guarda domain de la página actual
			var parts = location.hostname.split('.');
			domain = parts.slice(-2).join('.');
		}
		var exdate= new Date();
		exdate.setTime(exdate.getTime() + (exdays*24*60*60*1000));
		//IMPORTANTE: Añadir path para cualquier tipo de cookie para que no duplique cookies.
		var c_value=escape(value) + ((exdays==null) ? ";domain="+ domain +"; path=/" : "; expires=" + exdate.toUTCString() + ";domain="+ domain +"; path=/");
		document.cookie=c_name + "=" + c_value;
		};
	
	/**
	 * Devuelve el valor de una cookie
	 */
	var getCookieValue = function(id){
		
		if(!id) return null;
		
		id+='=';
		var cookie = null;
		
		try{
			cookie = top.document.cookie.split(id);
		}catch(error){
			cookie = document.cookie.split(id);
		}
		
		//Si existe
		if(cookie && cookie.length>1){
			cookie = ((cookie[1]).split(";"))[0] + "";
		}else{
			return null;
		}
		
		return decodeURIComponent(cookie);
	};
	
	/**
	 * Borra posibles cookies duplicadas por nombre de dominio con www.
	*/ 
	var borrarCookieDuplicada = function(){
		/**Si la cookie está creada para el segmento actual, borra aquella con "www" en el dominio.
		Al no especificar dominio en el document.cookie, se obtiene el actual con "www".
		Este método no borra las cookies actuales sin "www" en el dominio
		*/ 
		try{
			if (typeof getCookieValue(idCookieUltima) == 'string'){
				//Elimina posibles cookies con dominio "www.movistar.es"
				document.cookie = idCookieUltima + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
				//Elimina posibles cookies con subdominio ".www.movistar.es"
				document.cookie = idCookieUltima + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;domain=.www.movistar.es;path=/;";
				return true;
			}
			return false;
		}
		catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(informativo)(JavaScript)(ejecucion)",
				code: "EncuestaCSI.borrarCookieDuplicada",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
	};

	
	/*******************************************************
	 * Definición de las reglas de obligación y exclusión
	 *******************************************************/
	
	var exclusionesGenerales= function(){
		
		var valorPageName = '';
		try{
			valorPageName = (typeof window.top.s.pageName == 'string')? window.top.s.pageName : '';
		}catch(error){
			valorPageName = (typeof s.pageName == 'string')? s.pageName : '';
		}
		
		var vPathname = "";
		try{
			vPathname = (typeof window.top.location.pathname == 'string') ?  window.top.location.pathname : '';
		}catch(error){
			vPathname = (typeof window.location.pathname == 'string') ?  window.location.pathname : '';
		}
		
		var vHref = "";
			try{
				vHref = (typeof window.top.location.href == 'string') ?  window.top.location.href : '';
			}catch(error){
				vHref = (typeof window.location.href == 'string') ?  window.location.href : '';
			}
		
		//Recomendador de BI
		if(vPathname.indexOf('Aplicaciones/recomendacionBI')>=0) return true;
		if(vPathname.indexOf('particulares/Aplicaciones/configurador-tv')>=0) return true;
		
		//Formularios de proceso de compra
		if(vPathname.indexOf("Privada/ConfiguracionApp") >= 0 || vPathname.indexOf("Privada/CompraManual") >= 0 || vPathname.indexOf("CheckoutMoviles/") >= 0 || 
		vPathname.indexOf("Carro") >= 0 || vPathname.indexOf("particulares/movil/moviles/canje-de-puntos/ficha")>=0 ||
		vPathname.indexOf("particulares/Aplicaciones/formulario-compra")>=0 || vPathname.indexOf("particulares/Aplicaciones/confirmacion")>=0)
			return true;
		
		if(valorPageName.indexOf("oferta-combinada:fusion:opciones-tarifas:momentos-fusion") >= 0 || 
		valorPageName.indexOf("oferta-combinada:fusion:opciones-tarifas:configuracion")>=0 || 
		valorPageName.indexOf("oferta-combinada:movil-fusion")>=0)
			return true;
		
		//Proceso compra orquestador (solo se lanza en la pantalla de confirmación "#/Confirmacion")
		if(vHref.indexOf("Aplicaciones/Orquestador/") >= 0){
			try{
				var nodeInfo = ORQ.api.getCurrentNodeInfo();
				if(nodeInfo == null)
					return true;
				//Se excluyen todos los pasos menos la confirmación del pedido
				if(nodeInfo.id!="nodoConfirmacionPedido")
					return true;
			}	
			catch (error){
			}
		}

		if(typeof tgcProcesosCompra != "undefined")
			return true;
		
		//Se bloquea la encuesta para mobile (ancho de pantalla<640 px) solo si el segmento es aplicateca (encuesta no responsive)
		try{
			if(screen.width<640){
				if (segmento=="aplicateca")
					return true;
			}
		}catch(error){}

		//Las paginas 404
		if(vPathname.indexOf("404") >= 0)
			return true;
		
		//Formularios de reclamacion
		if(valorPageName.indexOf("reclamacio") >= 0 || valorPageName.indexOf('escribenos')>=0 || vPathname.indexOf("reclamacio") >= 0)
			return true;
		
		//Pagina de desafio
		if(valorPageName.indexOf("privada:desafio")>= 0 || vPathname.indexOf("Desafio") >= 0)
			return true;

		//Mobile Connect
		if(valorPageName.indexOf("particulares:privada:mobileconnect")>= 0 || vPathname.indexOf("iniciomobileconnect") >= 0)
			return true;
		
		//Buscador
		if(valorPageName.indexOf("aplicaciones:buscador-gsa")>= 0 || vPathname.indexOf("buscador-gsa") >= 0)
			return true;
			
		//Idioma
		if(typeof userInfoIdiomaNav != 'undefined' && (userInfoIdiomaNav == "ca_ES" || userInfoIdiomaNav == "gl_ES" || userInfoIdiomaNav == "eu_ES") )
			return true;
		
		//Cesta de la compra
		if(vPathname.indexOf("Privada/cesta-compra-movil/") >=0)
			return true;
		
		//Portal alejandra
		if(valorPageName.indexOf("portalalejandra")>=0)
			return true;
		
		//Estaticos html
		if(vPathname.indexOf("/estaticos/html/") >=0)
			return true;
		
		if(valorPageName.indexOf("encuesta") >= 0)
			return true;
		
		//Movistar GO
		if(valorPageName.indexOf("particulares:privada:imagenio-n-pantallas") >= 0 || vPathname.indexOf('Privada/imagenio-n-pantallas')>=0)
			return true;
		
		//Proceso de compra y movistar GO
		if(valorPageName.indexOf("particulares:privada:ppcexprress") >= 0 || valorPageName.indexOf("particulares:privada:compramanual") >= 0 || vPathname.indexOf('ppcexprress')>=0 || vPathname.indexOf("CheckoutExpressApp") >= 0)
			return true;
		
		//Proceso de compra y movistar GO
		if(valorPageName.indexOf("particulares:privada:ppcappexprress") >= 0)
			return true;
			
		//Proceso de compra
		if(valorPageName.indexOf("checkoutexpressapp") >=0 || valorPageName.indexOf("checkoutapp")>=0  || vPathname.indexOf("particulares/Aplicaciones/procesoCompra")>=0)
			return true;
		
		//Proceso de compra procesando
		if((valorPageName.indexOf("particulares/Aplicaciones/procesando") >= 0) || vPathname.indexOf('procesando')>=0)
			return true;
		
		//Pago con tarjeta
		if((valorPageName.indexOf("particulares:aplicaciones:paginaconfirmacion") >= 0))
			return true;
		if((valorPageName.indexOf("particulares:aplicaciones:formulariopagotarjeta") >= 0))
			return true;
		
		//Página extras
		if(vPathname.indexOf("/particulares/Aplicaciones/extras")>=0) 
			return true;
		
		//Regeneración
		if(valorPageName=='conv:regenera') 
			return true;	
		
		//Login
		if(vPathname.indexOf('acceso-unico')>=0) 
			return true;
		
		//Agregación
		if(vPathname.indexOf('agregacion')>=0) 
			return true;
		
		//Configurador TV
		if(vPathname.indexOf('configurador-tv')>=0) return true;
		if (vPathname.indexOf('television/crea-tv')>=0) return true;
		
		//Configurador express TV
		if (vPathname.indexOf('television/crea-tv')>=0) return true;
		
		//Proceso y resultado de consulta de cobertura
		if((valorPageName.indexOf("callejerodesencapsulado") >= 0) || (vPathname.indexOf("coberturas?") >= 0) || 
		(vPathname.indexOf("CoberturaDesencapsulada") >= 0) || (vPathname.indexOf("CoberturaDesencapsuladaOriginal") >= 0) || 
		(vPathname.indexOf("CallejeroDesencapsulado") >= 0) || (vPathname.indexOf("CallejeroDesencapsuladoOriginal") >= 0))
			return true;
		
		//Cobertura
		if (vPathname.indexOf('/coberturas/')>=0) return true;
		
		//Cobertura
		if (vPathname.indexOf('resultadosDesencapsuladoController')>=0) return true;

		//formulario baja desde backoficce
		if(valorPageName.indexOf("particulares:baja_servicios_productos") >= 0 || vPathname.indexOf('/particulares/Baja_Servicios_Productos/')>=0)
			return true;

		//página de encuesta por email no salta modal inicial
		if(vPathname.indexOf('/particulares/Aplicaciones/csi-emailing-lightbox/')>=0)
			return true;

		//Página seguimiento pedido
		if((valorPageName.indexOf("particulares:atencion-cliente:seguimiento-pedido") >= 0))
			return true;

		//Formulario seguimiento pedido
		if((valorPageName.indexOf("particulares:atencion-cliente:formulario-seguimiento") >= 0))
			return true;

		//Formulario seguimiento pedido
		if((valorPageName.indexOf("particulares:atencion-cliente:formulario-seguimiento") >= 0))
			return true;

		//Página contratación paquetes y canalas TV
		if((valorPageName.indexOf("particulares:tv-suscripciones:login") >= 0))
			return true;

		//Reclamaciones en el Asistente
		if((vHref.indexOf("q=reclamar") >= 0))
			return true;

		//Formulario manual orquestador
		if((valorPageName.indexOf("particulares:aplicaciones:formulariomanualorquestador") >= 0))
			return true;

		//Usuarios logados en Comunidad (existe cookie "LithiumUserInfo") -> REGLA DESACTIVADA
		/*if (typeof(getCookieValue("LithiumUserInfo")) == "string")
			return true;
		*/
		
		//Si no se cumple ninguna regla, devuelve false
		return false;	
	}

	/**
	 * Devuelve true si es excluida en el contexto actual
	 * @returns {Boolean}
	 */
	var exclusionesEmpresas = function(){
			
		var vPathname = "";
		try{
			vPathname = (typeof window.top.location.pathname == 'string') ?  window.top.location.pathname : '';
		}catch(error){
			vPathname = (typeof window.location.pathname == 'string') ?  window.location.pathname : '';
		}
		
		//url
		if(vPathname.indexOf('empresas/atencion-cliente/soporte-tecnico')>0) return true;
		
		//Registro
		if(vPathname.indexOf('registro')>=0) return true;
		
		if(valorPageName=='conv:registro') return true;
		
		var valorPageName = '';
		try{
			valorPageName = (typeof window.top.s.pageName == 'string')? window.top.s.pageName : '';
		}catch(error){
			valorPageName = (typeof s.pageName == 'string')? s.pageName : '';
		}
		
		//Registro de reclamaciones
		if(valorPageName=='mimovistar:empresas:realizar-reclamacion')return true;
		if(valorPageName=='mimovistar:empresas:realizar-reclamacion:reclamaciones_fijo') return true;
		if(valorPageName=='mimovistar:empresas:realizar-reclamacion:reclamaciones_sobre_pedidos') return true;
		if(valorPageName=='mimovistar:empresas:realizar-reclamacion:reclamaciones_movil') return true;
		
		//Registro averias
		if(valorPageName=='mimovistar:empresas:averias') return true;
		if(valorPageName=='mimovistar:empresas:comunicar_averia') return true;
		if(valorPageName=='mimovistar:empresas:averias_iframe') return true;
		
		//Consulta Averias
		if(valorPageName=='minovistar:empresas:consultar_averias') return true;
		if(valorPageName=='empresas:ayuda:escribanos') return true;
		
		//Si no se cumple ninguna regla, devuelve false
		return false;
		
	}

	/**
	 * Devuelve true si se encuentra excluido el lanzamiento en este contexto
	 * 
	 * @returns {Boolean}
	 */
	var exclusionesCanalPremium = function(){
		
		var valorPageName = '';
		try{
			valorPageName = (typeof window.top.s.pageName == 'string')? window.top.s.pageName : '';
		}catch(error){
			valorPageName = (typeof s.pageName == 'string')? s.pageName : '';
		}
		
		if(!valorPageName)
			return false;
		
		//Proceso de realización de pedidos: gestión de pedidos de terminales móviles, con alta o sin alta.
		if(valorPageName=='catalogo:proceso de pedidos:proceso pedidos')return true;
		
		//Alta de linea móvil
		if(valorPageName=='gestiones:tramitaciones:alta de lineas:altalineas')return true;
		
		//Gestión de cambios del servicio corporativo asociadas a las lÃ­neas móviles
		if(valorPageName=='servicios:corporativo:lÃ­neas moviles:gestion de lineas moviles:gestion de lineas')return true;
		
		//Gestión de usuarios: creación de usuarios secundarios en el portal.
		if(valorPageName=='area usuario:gestion de usuarios:administradores:gestion de usuarios:gestionusuariosadmin')return true;
		
		//Si no se cumple ninguna regla, devuelve false
		return false;
	}
	
	
	/**
	 * Añade las reglas de exclsion
	 */
	var reglasExclusion = function(){
		
		if(segmento != "aplicateca")
			this_csi.addExclusion(exclusionesGenerales);
		
		if (segmento == "canalPremium")
			this_csi.addExclusion(exclusionesCanalPremium);
		
		else if (segmento == "empresas")
			this_csi.addExclusion(exclusionesEmpresas);
		
	};
	
	/**
	 * Añade las reglas de obligación
	 */
	var reglasObligacion = function(){
		
		if(segmento == "particulares"){
			this_csi.addObligacion(function(){
				
				var vPathname = "";
				try{
					vPathname = (typeof window.top.location.pathname == 'string') ?  window.top.location.pathname : '';
				}catch(error){
					vPathname = (typeof window.location.pathname == 'string') ?  window.location.pathname : '';
				}
				
				var valorPageName = '';
				try{
					valorPageName = (typeof window.top.s.pageName == 'string')? window.top.s.pageName : '';
				}catch(error){
					valorPageName = (typeof s.pageName == 'string')? s.pageName : '';
				}
			});
		}
		
	};

	/**
	 * Suscripción a eventos de Orquestador
	 * @param id Identificador del evento a suscribirse
	 */
	var suscribirEventoOrquestador = function(id){
		if (typeof(ORQ)!="undefined"){
			ORQ.onReady(function(){
				ORQ.api.onStepChange(function(nodeInfo){
					if (nodeInfo!=null && nodeInfo.id==id)
						this_csi.reevaluar();
					else 
						return false;
				});
			});
		}
		else return false;
	}
	
	//INICIALIZACIÓN
	
	/**
	 * Inicializa todo el comportamiento de la encuesta
	 */
	var init = function(){
		try{	
			segmento = determinaSegmento();
			actualizarCookieIds();
			actualizarClics();
			reglasExclusion();
			reglasObligacion();
			borrarCookieDuplicada();
			
			//Depuracion
			if(csiDebug && csiDebug.isOn()){
				console.log("_______Depuración EC____");
				console.log("Version: " + version);
				console.log("Segmento: " +  segmento);
				console.log("Nº clics acumulados: " + n_clicks_acum);
				console.log("Última interacción con la encuesta: " + new Date(parseFloat(getCookieValue(idCookieUltima))).toString());
				console.log("[Modal Inicial] Probabilidad de aparición: " + (configs[segmento]["modalInicial"].probabilidad) + "%");
				console.log("[Modal Inicial] Nº clics configurados: " + (configs[segmento]["modalInicial"].clics));
				console.log("[Modal Minimizado] Nº clics configurados: " + ((configs[segmento]["modalMinimizado"]) ? configs[segmento]["modalMinimizado"].clics : "null") );
				console.log("¿Marca Minimizada?: " + (getCookieValue(idCookieMinimizada)));
				console.log("URL origen: " + (getCookieValue(idCookieURLInicio)));
				console.log("Nombre página origen: " + (getCookieValue(idCookiePageNameInicio)));
				console.log("¿Encuesta lanzada en móvil?: " + (getCookieValue(idCookieEsMobile)));
				console.log("Validez encuesta (dias): " + (configs[segmento].validez));
				console.log("¿Reglas exclusión activas?: " + this_csi.isExcluida());
				console.log("¿Reglas obligación activas?: " + this_csi.isObligada());
				console.log("_________________________");
			}
		
			setTimeout(function(){
				ejecutar();
			}, normalDelay);
			
			//Establece configuración de variables para depuración
			if(csiDebug && csiDebug.isOn()){
				this_csi.startDebug();
			}
			
			return  true;
		
		}catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(critico)(JavaScript)(inicializacion)",
				code: "EncuestaCSI.init",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
		
	};
	
	$(document).ready(function(){
		try{
			init();
			//Suscripción a evento de confirmación para proceso de compra en Orquestador
			suscribirEventoOrquestador("nodoConfirmacionPedido");			

		}catch(error){
			if (csiDebug)
				csiDebug.sendError({
				name: "(critico)(JavaScript)(inicializacion)",
				code: "EncuestaCSI.init",
				message: "Segmento: " + segmento + " Error JavaScript. Name -> " + error.name + " | Message -> " + error.message,
				error: error
			});
		}
	});
	
}

//Creación Instancia Global
	var encuestaCSI = new EncuestaCSI();

/**
 * Incluye el código de tagger en páina... Afecta a todo el DOM
 * 
 * Tagger Version: 2.213
 */
var includeTagger = function(){

	if("undefined"==typeof Tagger||"function"!=typeof Tagger.getInstance||"object"!=typeof Tagger.getInstance())window.Tagger=function(){function A(z){function h(a,d,f,b){f=f?f:"";b=b?b:3;this.getName=function(){return f};this.getScope=function(){return b};this.getDimension=function(){return parseInt(a)};this.getValue=function(){try{return"function"==typeof d?d():d}catch(e){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.TaggerDimension.getValue",message:"Dimension -> "+a+". Error JavaScript. Name -> "+
		e.name+" | Message -> "+e.message,error:e},!0)}return null};this.toGA=function(){(function(a){l.onConnectReady(function(){try{u._setCustomVar(a.getDimension(),a.getName(),a.getValue(),a.getScope())}catch(b){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.TaggerDimension.toGA",message:"Error JavaScript. Name -> "+b.name+" | Message -> "+b.message,error:b},!0)}})})(this)};this.toUA=function(){(function(a){l.onConnectReady(function(){try{g.set("dimension"+a.getDimension(),a.getValue())}catch(b){return c&&
		c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.TaggerDimension.toUA",message:"Error JavaScript. Name -> "+b.name+" | Message -> "+b.message,error:b},!0),!1}})})(this)};this.checkVar=function(){var b=!0;if("number"!=typeof a||0>a)b=!1,c&&c.isOn()&&(console.log("Variable g_dimension incorrecta: "),console.debug(a));return b};if(!this.checkVar())throw{name:"Error con los parametros",message:"Error con las variables pasadas para la creaci\u00f3n del objeto TaggerDimension"};}function x(a,
		d,f,b,e){var p={},m={};this.copy=function(){var c=new x(a,d,f,b,e),n;for(n in p)c.insertTaggerDimension(n);for(n in m)c.insertCustomDimension(m[n]);return c};this.getCategory=function(){return a};this.getAction=function(){try{var b="function"==typeof d?d():d;return b?b:null}catch(e){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.TaggerEvent.getAction",message:"Category -> "+a+". Error JavaScript. Name -> "+e.name+" | Message -> "+e.message,error:e},!0)}return null};this.getLabel=
		function(){try{var b="function"==typeof f?f():f;return b?b:null}catch(e){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.TaggerEvent.getLabel",message:"Category -> "+a+". Error JavaScript. Name -> "+e.name+" | Message -> "+e.message,error:e},!0)}return null};this.setLabel=function(a){f=a};this.getValue=function(){try{var e="function"==typeof b?b():b;return"number"==typeof e&&0<=e?e:null}catch(p){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.TaggerEvent.getValue",
		message:"Category -> "+a+". Error JavaScript. Name -> "+p.name+" | Message -> "+p.message,error:p},!0)}return null};this.insertTaggerDimension=function(b){try{if("number"==typeof b||"string"==typeof b)return p[b+""]=!0;if("undefined"!=typeof b&&b instanceof Array){for(var e=0;e<b.length;e++)p[b[e]+""]=!0;return!0}}catch(m){c&&c.sendError({name:"(informativo)(sc-ejecucion)(JavaScript)",code:"TG.TaggerEvent.insertarTaggerDimension",message:"Category -> "+a+". Error JavaScript. Name -> "+m.name+" | Message -> "+
		m.message,error:m},!0)}return!1};this.insertCustomDimension=function(b){try{if(!(b&&b instanceof h))return!1;m[b.getDimension()]=b;return!0}catch(e){c&&c.sendError({name:"(informativo)(sc-ejecucion)(JavaScript)",code:"TG.TaggerEvent.insertCustomDimension",message:"Category -> "+a+". Error JavaScript. Name -> "+e.name+" | Message -> "+e.message,error:e},!0)}return!1};this.execute=function(a,b){(function(a,b,e){l.onConnectReady(function(){try{a.insertTaggerDimension(67);if(c&&c.isOn()){console.log("SEND EVENT:|Category: "+
		a.getCategory());console.log("           |Action:   "+a.getAction());console.log("           |Label:    "+a.getLabel());var f={},d;for(d in m){var k=m[d];k instanceof h&&(f[k.getDimension()]=k.getValue())}if(b instanceof Array)for(d in b)k=b[d],k instanceof h&&(f[k.getDimension()]=k.getValue());for(var y in p)(k=l.getTaggerDimension(y))&&k.getValue()&&(f[y]=k.getValue());console.debug(f)}f="";e&&(f=u._get("page"))&&l.setPage(e);F();for(d in m)k=m[d],k instanceof h&&k.toGA();if(b instanceof Array)for(d in b)k=
		b[d],k instanceof h&&k.toGA();for(y in p)k=l.getTaggerDimension(y),k instanceof h&&k.toGA();a.toGA();var n={};for(d in m)k=m[d],k instanceof h&&(n["dimension"+k.getDimension()]=k.getValue()+"");if(b instanceof Array)for(d in b)k=b[d],k instanceof h&&(n["dimension"+k.getDimension()]=k.getValue()+"");for(y in p)k=l.getTaggerDimension(y),k instanceof h&&k.getValue()&&(n["dimension"+y]=k.getValue()+"");a.toUA(n);e&&f&&l.setPage(f)}catch(g){c&&c.sendError({name:"(critico)(sc-ejecucion)(JavaScript)",code:"TG.TaggerEvent.execute",
		message:"Error JavaScript. Name -> "+g.name+" | Message -> "+g.message,error:g},!0)}})})(this,a,b)};this.toGA=function(){(function(a){l.onConnectReady(function(){try{u._trackEvent(a.getCategory(),a.getAction(),a.getLabel(),a.getValue())}catch(b){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.TaggerEvent.toGA",message:"Error JavaScript. Name -> "+b.name+" | Message -> "+b.message,error:b},!0)}})})(this)};this.toUA=function(b,e){try{var d={hitType:"event",eventCategory:this.getCategory(),
		eventAction:this.getAction()},p=this.getLabel(),f=this.getValue();null!=p&&(d.eventLabel=p);null!=f&&(d.eventValue=f);if("object"==typeof b)for(var m in b)d[m]=b[m];if("object"==typeof e)for(m in e)d[m]=e[m];(function(a){l.onConnectReady(function(){try{g.send(a)}catch(b){return c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.TaggerEvent.toUA",message:"Error JavaScript. Name -> "+b.name+" | Message -> "+b.message,error:b},!0),!1}})})(d)}catch(h){return c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",
		code:"TG.TaggerEvent.toUA",message:"Category -> "+a+". Error JavaScript. Name -> "+h.name+" | Message -> "+h.message,error:h},!0),!1}return!0};this.checkVar=function(){var b=!0;"string"==typeof a&&a||(b=!1,c&&c.isOn()&&(console.log("Variable category incorrecta: "),console.debug(a)));"function"!=typeof d&&"string"!=typeof d&&(b=!1,c&&c.isOn()&&(console.log("Variable action incorrecta: "),console.debug(d)));return b};if(!this.checkVar())throw{name:"Error con los parametros",message:"Error con las variables pasadas para la creaci\u00f3n del objeto TaggeEvent"};
		}function t(){function a(a){try{if(!a)return null;var c=$(a).attr("tg-dimensions");a=[];if(!c)return null;var c=c.split(";"),d;for(d in c){var f=c[d];if(f){var n=f.split(":",2);if(2==n.length&&n[1]){var l=parseInt(n[0]),g=new h(l,n[1],"InlineTagging",3);a.push(g)}else b&&b.sendError({name:"(informativo)(inicializacion)",code:"TaggerInline.get_tg_dimensions",message:"tg-dimensions mal formado: "+f},!0)}}return a}catch(r){b&&b.sendError({name:"(critico)(ejecucion)(JavaScript)",code:"TaggerInline.get_tg_dimensions",
		message:"Error JavaScript. Name -> "+r.name+" | Message -> "+r.message,error:r},!0)}return null}function c(e,d,f){try{if(!e)return!1;e=$(e);if("true"!=e.attr("tg-enabled"))return!1;var y=e.attr("tg-virtualPage"),n=a(e),h=l.getTaggerEvent(d);h instanceof x?(h.getLabel()||h.setLabel(f),h.execute(n,y)):b&&b.sendError({name:"(informativo)(ejecucion)",code:"TaggerInline.executeInlineElem",message:"Evento no registrado en tagger"},!0)}catch(g){b&&b.sendError({name:"(critico)(ejecucion)(JavaScript)",code:"TaggerInline.executeInlineElem",
		message:"Error JavaScript. Name -> "+g.name+" | Message -> "+g.message,error:g},!0)}}var f={click:function(a,b,f){(function(a,b,e){$(a).click(function(){c(this,b,e)})})(a,b,f)},load:function(a,b,f){c($(a),b,f)},visible:function(a,b,f){$(a).is(":visible")&&c($(a),b,f)}},b=null;try{b=new MovistarDebug("TG-ERROR","TaggerInline",l.getVersion())}catch(e){"undefined"!=typeof console&&(console.log("No se puede inicalizar la variable de depuraci\u00f3n. No habr\u00e1 informaci\u00f3n de depuraci\u00f3n"),
		console.debug(e))}this.init=function(c){try{("undefined"!=typeof c?$(c).find("[tg-enabled='true']"):$("body").find("[tg-enabled='true']")).each(function(c,e){try{var d=$(e).attr("tg-virtualizePage");if(d){b&&b.isOn()&&console.log("INLINE VIRTUALIZE PAGE:|Page:      "+d);var n=a(e);l.virtualizePage(d,null,null,n)}}catch(h){b&&b.sendError({name:"(critico)(ejecucion)(JavaScript)",code:"TaggerInline.virtualizePage",message:"Error JavaScript. Name -> "+h.name+" | Message -> "+h.message,error:h},!0)}try{var g=
		$(e).attr("tg-events");if(g){var g=g.split(";"),u;for(u in g){var r=g[u];if(r){var q=r.split(":",3);if(2<=q.length){var w=q[0],k=q[1],v=q[2],t=f[k];"function"==typeof t?(b&&b.isOn()&&(console.log("INLINE EVENT:|TaggerId:      "+w),console.log("             |TaggerTrigger: "+k),console.log("             |CustomLabel:   "+v)),t($(e),w,v)):b&&b.sendError({name:"(informativo)(inicializacion)",code:"TaggerInline.prepareEvents",message:"Error con el disparador, disparador no contemplado: "+q[1]},!0)}else b&&
		b.sendError({name:"(informativo)(inicializacion)",code:"TaggerInline.prepareEvents",message:"Error formato tg-events inline: "+r},!0)}}}}catch(h){b&&b.sendError({name:"(critico)(ejecucion)(JavaScript)",code:"TaggerInline.prepareEvents",message:"Error JavaScript. Name -> "+h.name+" | Message -> "+h.message,error:h},!0)}})}catch(d){b&&b.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TaggerInline.init",message:"Error JavaScript. Name -> "+d.name+" | Message -> "+d.message,error:d},!0)}};
		this.startDebug=function(){b.start()};this.stopDebug=function(){b.stop()}}function D(a,c){var f=null;try{f=new MovistarDebug("TG-ERROR","TaggerHot",l.getVersion())}catch(b){"undefined"!=typeof console&&(console.log("No se puede inicalizar la variable de depuraci\u00f3n. No habr\u00e1 informaci\u00f3n de depuraci\u00f3n"),console.debug(b))}this.startDebug=function(){f.start()};this.stoptDebug=function(){f.stop()};this.init=function(){if("object"==typeof c){var b;f&&f.isOn()&&console.log("HOT DIMENSIONS:");
		for(var e in c){var p=Number(e),m=c[e];(b=l.setTaggerDimension(p,m))&&f&&f.isOn()&&console.log("           |Index:    "+p+" Value: "+m)}}if("object"==typeof a)for(var g in a)if(b=a[g],e=l.setTaggerEvent(g,b.category,b.action,b.label,b.value,null,b.predefinedDimensions),e instanceof x&&"object"==typeof b.customDimensions){f&&f.isOn()&&(console.log("HOT EVENT: |TaggerId:    "+g),console.log("           |Category:    "+b.category),console.log("           |Action:      "+b.action),console.log("           |Label:       "+
		b.label),console.log("           |Value:       "+b.value),console.log("           |predefDimensions:     "+b.predefinedDimensions),console.log("           |customDimensions:     "));for(var n in b.customDimensions)p=b.customDimensions[n],m=new h(Number(n),p),e.insertCustomDimension(m),f&&f.isOn()&&console.log("                  | Index: "+Number(n)+" Value: "+p)}}}function A(){if("undefined"==typeof _gaq&&-1==document.getElementsByTagName("head")[0].innerHTML.indexOf("ga.js")){window._gaq=window._gaq||
		[];_gaq.push(["_setAccount",B]);var a=document.createElement("script");a.type="text/javascript";a.async=!0;a.src=("https:"==document.location.protocol?"https://ssl":"http://www")+".google-analytics.com/ga.js";var d=document.getElementsByTagName("script")[0];d.parentNode.insertBefore(a,d);c&&c.isOn()&&console.log("Inserci\u00f3n explicita de ga.js: "+B+". No se encontraron instancias anteriores")}}function N(){"undefined"==typeof ga&&-1==document.getElementsByTagName("head")[0].innerHTML.indexOf("analytics.js")&&
		(function(a,c,f,b,e,p,m){a.GoogleAnalyticsObject=e;a[e]=a[e]||function(){(a[e].q=a[e].q||[]).push(arguments)};a[e].l=1*new Date;p=c.createElement(f);m=c.getElementsByTagName(f)[0];p.async=1;p.src=b;m.parentNode.insertBefore(p,m)}(window,document,"script","//www.google-analytics.com/analytics.js","ga"),ga("create","UA-46169604-5","auto"),c&&c.isOn()&&console.log("Inserci\u00f3n explicita de analytics.js: UA-46169604-5. No se encontraron instancias anteriores"))}function O(){try{null==u&&("undefined"==
		typeof _gaq&&A(),G||(G=!0,_gaq.push(function(){var a;a=_gat._getTrackerByName()._getAccount();H[a]||(a=B);u=_gat._createTracker(a,v);c&&c.isOn()&&console.log('Creado tracker (GA): "'+v+'" idGA: "'+a+'".');g&&I()})))}catch(a){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.Tagger.initConexionGA",message:"Conexion con GA. Error JavaScript. Name -> "+a.name+" | Message -> "+a.message,error:a},!0)}}function P(){try{null==g&&("undefined"==typeof ga&&N(),J||(J=!0,ga(function(){g=ga.getByName(v);
		if(!g){var a=ga.getByName("t0")?ga.getByName("t0").get("trackingId"):"UA-46169604-5";Q[a]||(a="UA-46169604-5");ga("create",{trackingId:a,name:v});g=ga.getByName(v);c&&c.isOn()&&console.log('Creado tracker (UA): "'+v+'" idUA: "'+a+'".');u&&I()}})))}catch(a){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.Tagger.initConexionUA",message:"Conexion con UA. Error JavaScript. Name -> "+a.name+" | Message -> "+a.message,error:a},!0)}}function I(){c&&c.isOn()&&console.log("Vaciar cola de ejecuci\u00f3n -> "+
		C.length+" elementos en cola");for(var a=C.shift();"undefined"!=typeof a;a=C.shift())if("function"==typeof a)try{a()}catch(d){c&&c.sendError({name:"(informativo)(ejecucion)",code:"TG.Tagger.vaciarCola",message:"Error ejecutando funcion.  Error JavaScript ejecutando funcion de la pila. Name -> "+d.name+" | Message -> "+d.message+". Se intentar\u00e1 continuar con la ejecuci\u00f3n"},!0)}}function F(){l.onConnectReady(function(){for(var a=1;50>=a;a++)u._deleteCustomVar(a)})}function K(a){return window.location.pathname+
		("/"==window.location.pathname[window.location.pathname.length-1]?"virtual/":"/virtual/")+a}var l=null,c=null;try{c=new MovistarDebug("TG-ERROR","Tagger","2.220")}catch(a){"undefined"!=typeof console&&(console.log("No se puede inicalizar la variable de depuraci\u00f3n. No habr\u00e1 informaci\u00f3n de depuraci\u00f3n"),console.debug(a))}var u=null,g=null,B="UA-46169604-1",H={"UA-46169604-1":!0},Q={"UA-46169604-5":!0,"UA-46169604-6":!0},v="tg_tracker",G=!1,J=!1;if(1==z)try{if(c=new MovistarDebug("TG-ERROR",
		"Tagger_developer","2.220"),c.isOn())console.log("*****************************************"),console.log("             DEVELOPMENT MODE            "),console.log("*****************************************");B="UA-46169604-3";H={idGA_develop:!0};v="tg_develop_tracker"}catch(a){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.Tagger.initDevelopmentVars",message:"Error JavaScript. Name -> "+a.name+" | Message -> "+a.message,error:a},!0)}var L={},M={},C=[],E=!1;c&&c.isOn()&&(console.log("___TAGGER V: 2.220___"),
		console.log("SINGLE TAGGER INSTANCE"));return l={setTaggerEvent:function(a,d,f,b,e,p,m){try{if(!a)return c&&c.sendError({name:"(informativo)(inicializacion)(integridad)",code:"TG.Tagger.setTaggerEvent",message:"No se puede insertar un TaggerEvent sin id"},!0),null;var h=new x(d,f,b,e,p);if(h instanceof x)return(m instanceof Array||"number"==typeof m)&&h.insertTaggerDimension(m),L[a]=h;c&&c.sendError({name:"(informativo)(inicializacion)(integridad)",code:"TG.Tagger.setTaggerEvent",message:"Error creando instancia de TaggerEvent: "+
		h},!0)}catch(g){c&&c.sendError({name:"(informativo)(inicializacion)(JavaScript)",code:"TG.Tagger.setTaggerEvent",message:"Error JavaScript. Name -> "+g.name+" | Message -> "+g.message,error:g},!0)}return null},getTaggerEvent:function(a){return a?L[a+""]:null},setTaggerDimension:function(a,d,f,b){try{var e=new h(a,d,f,b);if(e instanceof h)return M[e.getDimension()]=e;c&&c.sendError({name:"(informativo)(inicializacion)(integridad)",code:"TG.Tagger.setTaggerDimension",message:"Error creando instancia de setTaggerDimension: "+
		e},!0)}catch(g){c&&c.sendError({name:"(informativo)(inicializacion)(JavaScript)",code:"TG.Tagger.setTaggerDimension",message:"Error JavaScript. Name -> "+g.name+" | Message -> "+g.message,error:g},!0)}return null},getTaggerDimension:function(a){return a?M[a+""]:null},virtualizePage:function(a,d,f,b){(function(a,b,f,d){if("string"!=typeof a||!a)return c&&c.sendError({name:"(informativo)(ejecucion)",code:"TG.Tagger.virtualizarPagina",message:"Error con el parametro 'page': "+a+" . Se intentar\u00e1 continuar con la ejecuci\u00f3n"},
		!0),!1;l.onConnectReady(function(){try{var n=K(a),v=n.replace(RegExp("/","g"),":");if(c&&c.isOn()){console.log("VIRT PAGE: |Page:     "+n);var t={};t[55]=window.location.href;t[67]=g.get("clientId")+"";if(d instanceof Array)for(var r in d){var q=d[r];q instanceof h&&(t[q.getDimension()]=q.getValue())}if(f instanceof Array)for(r in f){var w=f[r],q=l.getTaggerDimension(w);q instanceof h&&q.getValue()&&(t[w]=q.getValue())}console.debug(t)}u._set("page",n);if(d instanceof Array)for(r in d)q=d[r],q instanceof
		h&&q.toGA();if(f instanceof Array)for(r in f)w=f[r],q=l.getTaggerDimension(w),q instanceof h&&q.toGA();u._trackPageview(n);var k={page:n,dimension55:window.location.href,dimension67:g.get("clientId")+""};"string"==typeof b&&b&&(k.title=b);g.set("page",k.page);if(d instanceof Array)for(r in d)q=d[r],q instanceof h&&(k["dimension"+q.getDimension()]=q.getValue());if(f instanceof Array)for(r in f)w=f[r],q=l.getTaggerDimension(w),q instanceof h&&(k["dimension"+w]=q.getValue());g.send("pageview",k);l.setTaggerEvent("virtualizePageEvent",
		"Evento de pagina",v,window.location.href).execute()}catch(x){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.Tagger.virtualizarPagina",message:"Error JavaScript. Name -> "+x.name+" | Message -> "+x.message,error:x},!0)}})})(a,d,f,b)},setPage:function(a,d){(function(a,b,d){if("string"!=typeof a||!a)return c&&c.sendError({name:"(informativo)(ejecucion)",code:"TG.Tagger.setPage",message:"Error con el parametro 'page': "+a+" . Se intentar\u00e1 continuar con la ejecuci\u00f3n"},
		!0),!1;l.onConnectReady(function(){try{a=K(a),c&&c.isOn()&&console.log("SET PAGE:  |Page:     "+a),u._set("page",a),b?g.set({page:a,title:b}):g.set("page",a)}catch(d){c&&c.sendError({name:"(informativo)(ejecucion)(JavaScript)",code:"TG.Tagger.setPage",message:"Error JavaScript. Name -> "+d.name+" | Message -> "+d.message,error:d},!0)}})})(a,d)},inlineTagging:function(a){(new t).init(a)},hotTagging:function(a,c){(new D(a,c)).init()},startDebug:function(){c.start();(new t).startDebug();(new D).startDebug()},
		stoptDebug:function(){c.stop();(new t).stopDebug();(new D).stopDebug()},connect:function(){O();P()},onConnectReady:function(a){if("function"==typeof a)if(u&&g)try{a()}catch(d){c&&c.sendError({name:"(informativo)(ejecucion)",code:"TG.Tagger.onConnectReady",message:"Error ejecutando funcion.  Error JavaScript ejecutando funcion pasada. Name -> "+d.name+" | Message -> "+d.message+". Se intentar\u00e1 continuar con la ejecuci\u00f3n"},!0)}else E||l.initPredefinedTaggerDimension(),C.push(a),l.connect()},
		initPredefinedTaggerDimension:function(){if(!E){c&&c.isOn()&&console.log("PREDEFINED VARS: ");l.setTaggerDimension(11,function(){return"undefined"!=typeof s&&"undefined"!=typeof s.products&&s.products?s.products:"TG s.products no definido"},"Nombre de producto",3);l.setTaggerDimension(50,function(){return"undefined"!=typeof s&&"undefined"!=typeof s.pageName&&s.pageName?s.pageName:"TG s.pageName no definido"},"Nombre de pagina",3);l.setTaggerDimension(67,function(){try{return g.get("clientId")+""}catch(a){}return""},
		"Google ClientId",3);if(c&&c.isOn()){var a=[11,50],d={};if(a instanceof Array)for(var f in a){var b=a[f],e=l.getTaggerDimension(b);e instanceof h&&(d[b]=e.getValue())}console.debug(d)}E=!0}},clear:function(){F()},getVersion:function(){return"2.220"},container:{}}}var z=null,t=null;return{getInstance:function(){z||(z=A(!1));return z},getDevelopmentInstance:function(){t||(t=A(!0));return t}}}();window.TG=Tagger.getInstance();
}