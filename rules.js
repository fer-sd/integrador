/*
Clase rules - Integrador
*/

//Versión rules.js
var rulesVersion = 1.0;

function rules(){
/***** PARTE PRIVADA ******/

/***** Variables privadas ******/

var function(csi_status,csi){
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
        
/***** Métodos privados ******/

/***** PARTE PÚBLICA ******/

/***** Variables públicas ******/

/***** Métodos públicos ******/

}