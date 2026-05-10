
import {getLibresConductorInspector, getListaSubgrupoConductorInspector, getListaSubComunesConductorInspector} from './FechasConductorInspector.js';
import {letraAIndice} from './FuncionesComunes.js';

export function getListaLibresInspectorNoche(year, grupo) {
    const fechaInitGrupo1_2022 = new Date(2022, 0, 4);
    const secuenciaLibres = [2, 3, 2, 3];
    const secuenciaTrabajo = [8, 6, 7, 8];
    const totalSecuencia = 35;
    return getLibresConductorInspector(year, grupo, fechaInitGrupo1_2022, totalSecuencia, secuenciaLibres, secuenciaTrabajo);
}



//  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //
    //se cambian los subgrupos a partir del año 2020
    //se crea un array por cada grupo y cada posición del array corresponde a su letra a,b,c,d...
    //se guarda en cada posición la fecha de inicio de su respectiva letra
    // WHY (2026-05-09): los dos últimos new Date(...) (grupo 4 J y grupo 5 J)
    //   tenían un typo (faltaba la coma del día): (2022,21) y (2022,114).
    //   Reconstruidos a (2022,1,21) y (2022,1,14) siguiendo el patrón
    //   "-1 día respecto a Inspector" consistente con los otros 9 subgrupos.
    //   PENDIENTE: validar contra calendario impreso oficial.
    //   Ver docs/REVISION_CALENDARIOS.md → BUG-01.
    const subgrupos = [
        [new Date(2022,1,1), new Date(2022,0,2), new Date(2022,1,6), new Date(2022,0,6), new Date(2022,1,10), new Date(2022,0,12), new Date(2022,1,16), new Date(2022,0,3), new Date(2022,1,7), new Date(2022,2,14)],
        [new Date(2022,0,25), new Date(2022,2,1), new Date(2022,0,30), new Date(2022,2,6), new Date(2022,1,3), new Date(2022,0,5), new Date(2022,1,9), new Date(2022,2,16), new Date(2022,0,31), new Date(2022,2,7)],
        [new Date(2022,0,18), new Date(2022,1,22), new Date(2022,0,23), new Date(2022,1,27), new Date(2022,0,27), new Date(2022,2,3), new Date(2022,1,2), new Date(2022,2,9), new Date(2022,0,24), new Date(2022,1,28)],
        [new Date(2022,0,11), new Date(2022,1,15), new Date(2022,0,16), new Date(2022,1,20), new Date(2022,0,20), new Date(2022,1,24), new Date(2022,0,26), new Date(2022,2,2), new Date(2022,0,17), new Date(2022,1,21)],
        [new Date(2022,0,4), new Date(2022,1,8), new Date(2022,0,9), new Date(2022,1,13), new Date(2022,0,13), new Date(2022,1,17), new Date(2022,0,19), new Date(2022,1,23), new Date(2022,0,10), new Date(2022,1,14)]];


       export function getListaSubgrupoInspectorNoche(year, grupo, subgrupo) {
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
     * lunes = 2, miercoles = 3, martes = 1, jueves = 4, domingo = 0
     * @param fechaInit
     * @return 
     */
 function getPosSecuencia(fechaInit){
    const pos = 0;
    const day = fechaInit.getDay();
   switch(day){
       case 1: return 2;
       case 2: return 1;
       case 3: return 3;
       case 4: return 4;
   }
    return pos;
}


 //  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //
    //sábados de subgrupos comunes a dos grupos A-C-E-G-I y B-D-F-H-J a partir del 2020
    //las posiciones en el array están en el mismo orden
    const subComunes = [
        [new Date(2022, 0, 28), new Date(2022, 2, 4)],
        [new Date(2022, 0, 21), new Date(2022, 1, 25)],
        [new Date(2022, 0, 14), new Date(2022, 1, 18)],
        [new Date(2022, 0, 7), new Date(2022, 1, 11)],
        [new Date(2022, 1, 11), new Date(2022, 1, 4)]];


       export function getListaSubComunesInspectorNoche(year, grupo, subgrupo) {
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





