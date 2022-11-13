import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Persona} from '../models';
import {PersonaRepository} from '../repositories';
import {Llaves} from  '../config/llaves';
const generador = require("password-generator");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(PersonaRepository)
    public PersonaRepository: PersonaRepository
  ) { }//Así podemos acceder a los metódos del repositorio.

  /*
   GenerarClave() --> invoca al generador def. linia2. para que nos cree
   una contraseña aleatoria.
   */
  GenerarClave() {
    let clave = generador(8, false);
    return clave;
  }
  //Creamos el metodo que nos permita cifrar la clave.

  CifrarClave(clave: string) {//Acá importamos nuestro paquete.
    let claveCifrada = cryptoJS.MD5(clave).toString();//MD5 --> metódo de cifrado.
    return claveCifrada;
  }

  IdentificarPersona(usuario: string, clave: string) {//Con esto accedemos a la BD
    try {//ubicamos a la persona que corresponda a ese logueo. El acceso a la Bd se hace a traves de un repositorio.
      let p = this.PersonaRepository.findOne({where: {correo: usuario, clave: clave}})//Comparamos los datos que llegan con los la BD.
      if (p) {
        return p;
      }
    } catch {
      return false;

    }
  }

  GenerarTokenJWT(persona: Persona) {//Recibe una persona ya definida.
    //INSTALAMOS EL PAQUETE TOKEN --- y LO IMPORTAMOS ARRIVA  const....
    let token = jwt.sign({//Fecha de expiración no tiene.
      data: {
        id: persona.id,//Este id pertenece al id que se tiene en la base de datos.
        correo: persona.correo,
        nombre: persona.nombres + " " + persona.apellidos
        //Creamos una carpeta en src ---> config ---> file --> llaves.ts
      }
    },
    Llaves.claveJWT)
    return token;

  }
  ValidarTokenJWT(token: string){
    try{
      let datos =  jwt.verify(token, Llaves.claveJWT);
      return datos;
    }catch{
      return false;
    }

  }

}
