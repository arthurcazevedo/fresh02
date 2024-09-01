/// <reference lib="deno.unstable" />

import { defineRoute } from "$fresh/server.ts";
import { ResultSet, createClient } from "@libsql/client";
import "jsr:@std/dotenv/load";
  
export type tCampo = {name:string,type:string,size:number,value:string};
export type aCampo = Array<tCampo>;
export type aCampos = Array<aCampo>;


const client = createClient({
  url: "https://casoftapp-arthurcazevedo.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MTg5OTA0MDAsImlkIjoiYWRiMjUwNjEtNDY5Yi00YTk2LWEzMmItMTk3NDNjMDZhN2Y3In0.sr6RKmHPHaIah8ZND2Q0VMeCCrpdU5jKcdv62AigU_dzSs39o64Apq6IuUO31dthF_YxQaWTi48H20r2OMpHDg",
});

export const getJSON = async (data:ResultSet,colunas:ResultSet):Promise<aCampos> => {
  const result:aCampos = [];
  const data1 = await data;
  const colunas1 = await colunas;
  //console.debug(colunas1.rows[0]);

  if (data1.rows.length === 0 || colunas1.rows.length === 0) {
      return [];
  }
  const regex = /.*\((\d+)\).*/;

  let cCampos:aCampo = [];
  for (let i = 0; i < data1.rows.length; i++) {
      for (let j = 0; j < data1.columns.length; j++) {
          let tipo:string = data1.columnTypes[j].split('(')[0];
          switch (tipo) {
              case "VARCHAR2":
                  tipo = "text"
                  break;
          
                  case "NUMBER":
                  case "INTEGER":
                      tipo = "number"
                  break;
              
                  case "DATE":
                      tipo = "date"
                      break;
              
                  default:
                      break;
          }
          cCampos.push({name: data1.columns[j]
                       ,type: tipo
                       ,size: Number((regex.exec(data1.columnTypes[j]) ?? "0")[1] ?? "0")
                       ,value: String(data1.rows[i][j])
                  });
      }
      result.push(cCampos);
  }

  cCampos = [];
  for (let i2 = 0; i2 < colunas1.rows.length; i2++) {
      for (let j2 = 0; j2 < colunas1.columns.length; j2++) {
          cCampos.push({name: data1.columns[j2]
                      ,size: Number((regex.exec(data1.columnTypes[i2]) ?? "0")[1] ?? "0")
                      ,type: data1.columnTypes[i2].split('(')[0]
                      ,value: String(data1.rows[i2][j2])
                  });
      }
      //Cresult.push(cCampos);
  }

  result.push(cCampos);

  if (result.length === 0) {
      return [];
  }

  return result;
};

export default defineRoute(async (req, _ctx) => {

  const url = new URL(req.url);
  const params = url.searchParams;
  const id = params.get('id')
  //console.debug(_ctx);
  const perfis = client.execute({sql: "SELECT * FROM person where id in (?)" ,
                                   args: [id]
                                });
  const chaves = client.execute({sql: "SELECT name FROM pragma_table_info(?) where pk=1",
    args: ["person"]
  });
  
  //let perfil = (getJSON(perfis,chaves) as aCampos);
  //res.send(montaForm(perfil));
  const json = await getJSON(perfis,chaves)
  return new Response(JSON.stringify(json),{headers: [["Content-type","Application/json"]]});

  //return new Response(JSON.stringify(data), {
  //  headers: { 'Content-Type': 'application/json' },
  //});
})