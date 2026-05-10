
import {getLibresConductorInspector, getListaSubgrupoConductorInspector, getListaSubComunesConductorInspector} from './FechasConductorInspector.js';
import {letraAIndice} from './FuncionesComunes.js';

export function getListaLibresInspector(year, grupo) {
    const fechaInitGrupo1_2022 = new Date(2022, 0, 5);
    const secuenciaLibres = [2, 3, 2, 3];
    const secuenciaTrabajo = [8, 6, 7, 8];
    const totalSecuencia = 35;
    return getLibresConductorInspector(year, grupo, fechaInitGrupo1_2022, totalSecuencia, secuenciaLibres, secuenciaTrabajo);
}


 //  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //
    //se cambian los subgrupos a partir del año 2020
    //se crea un array por cada grupo y cada posición del array corresponde a su letra a,b,c,d...
    //se guarda en cada posición la fecha de inicio de su respectiva letra
  const subgrupos = [
[new Date(2022,1,2), new Date(2022,0,3), new Date(2022,1,7), new Date(2022,0,7), new Date(2022,1,11), new Date(2022,0,13), new Date(2022,1,17), new Date(2022,0,4), new Date(2022,1,8), new Date(2022,2,15)],
[new Date(2022,0,26), new Date(2022,2,2), new Date(2022,0,31), new Date(2022,2,7), new Date(2022,1,4), new Date(2022,0,6), new Date(2022,1,10), new Date(2022,2,17), new Date(2022,1,1), new Date(2022,2,8)],
[new Date(2022,0,19), new Date(2022,1,23), new Date(2022,0,24), new Date(2022,1,28), new Date(2022,0,28), new Date(2022,2,4), new Date(2022,1,3), new Date(2022,2,10), new Date(2022,0,25), new Date(2022,2,1)],
[new Date(2022,0,12), new Date(2022,1,16), new Date(2022,0,17), new Date(2022,1,21), new Date(2022,0,21), new Date(2022,1,25), new Date(2022,0,27), new Date(2022,2,3), new Date(2022,0,18), new Date(2022,1,22)],
[new Date(2022,0,5), new Date(2022,1,9), new Date(2022,0,10), new Date(2022,1,14), new Date(2022,0,14), new Date(2022,1,18), new Date(2022,0,20), new Date(2022,1,24), new Date(2022,0,11), new Date(2022,1,15)]];


export function getListaSubgrupoInspector(year, grupo, subgrupo) {
    const fechaInit = getFechaSubgrupo2022(grupo, subgrupo);
    const totalSecuencia = 350;
    //La secuencia de dias en orden del array son:
        // X - M - J - V - L  
    const secu = [65, 76, 79, 64, 66];
    const pos = getPosSecuencia(fechaInit);

    return getListaSubgrupoConductorInspector(year, fechaInit, totalSecuencia, secu, pos);
}


function getFechaSubgrupo2022(grupo, subgrupo) {
    const pos = letraAIndice(subgrupo);
    if(grupo >= 1 && grupo <= 5){
        return subgrupos[grupo-1][pos];
    }
    return subgrupos[grupo-1][0];
}


/**
     * distancias entre dias, la secuencia de dias es
     * lunes = 0, miercoles = 1, martes = 2, jueves = 3, viernes = 4
     * @param fechaInit
     * @return 
     */
 function getPosSecuencia(fechaInit){
    const pos = 0;
    const day = fechaInit.getDay();
   switch(day){
       case 2: return 2;
       case 3: return 1;
       case 4: return 3;
       case 5: return 4;
   }
    return pos;
}



 //  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //
    
      //sábados de subgrupos comunes a dos grupos A-C-E-G-I y B-D-F-H-J a partir del 2020
    //las posiciones en el array están en el mismo orden
    const subComunes = [
        [new Date(2022,0,29), new Date(2022,2,5)],
        [new Date(2022,0,22), new Date(2022,1,26)],
        [new Date(2022,0,15), new Date(2022,1,19)],
        [new Date(2022,0,8), new Date(2022,1,12)],
        [new Date(2022,0,1), new Date(2022,1,5)]];


       export function getListaSubComunesInspector(year, grupo, subgrupo) {
            const fechaInit = getFechaSubComunes2022(grupo, subgrupo);
            const totalSecuencia = 70;
            return getListaSubComunesConductorInspector(year, fechaInit, totalSecuencia);
        }


        function getFechaSubComunes2022(grupo, subgrupo) {
            let pos = 0;
            //A-C-E-G-I = 0   B-D-F-H-J=1
            if (subgrupo === "B" || subgrupo === "D" || subgrupo === "F" || subgrupo === "H" || subgrupo === "J") {
                pos = 1;
            }
            if (grupo >= 1 && grupo <= 5) {
                return subComunes[grupo - 1][pos];
            }
            return subComunes[grupo - 1][0];
        }



