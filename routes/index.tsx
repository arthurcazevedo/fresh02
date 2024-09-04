
import { FreshContext, PageProps, Handlers } from "$fresh/server.ts";
//import { render } from "$fresh/src/server/render.ts";
import type { aCampo, aCampos, tCampo } from "./api/dbx.ts"

interface Props {
  perfil: aCampos | null;
}

export const handler: Handlers<Props> = {
    async GET(_req:Request, _ctx:FreshContext) {
      const url = new URL(_req.url);
      const id = url.searchParams.get("id") || "";
      //const form = await _req.formData();
      //const id = form.get("id")?.toString();
      //console.debug("handler id: [" , Number(id), "]");
      try {
        const response = await fetch("http://localhost:8000/api/db?id=" + id);
        if (!response.ok) {
          return _ctx.renderNotFound({
            message: "Perfil não encontrado ou erro na API",
          });
        }
        const perfil = await response.json();
        return await _ctx.render({ perfil });
      } catch (error) {
        console.error("Erro ao buscar o perfil:", error);
        return _ctx.renderNotFound({
          message: "Erro ao buscar o perfil",
        });
      }
    },
  };
  
export default function MontaForm(perfil: PageProps<Props>) {
    const { data } = perfil;
    //console.debug(`MontaForm entrou`);
    if (!data || !data.perfil || data.perfil.length < 1) {
      return (
        <form>
          <input type="number" name={"id"} min={1} max={100000} maxLength={7}/>
          <input type={"submit"} name={"manda"} label={"manda"} value={"manda"} />
        </form>
      ); 
    }

    const cPerfil = data.perfil || undefined;
    //let form = '<form>';
    ////console.debug(data);
    //cPerfil.forEach((campos:aCampo) => {
    //  campos.map((campo:tCampo) => {
    //    form += `<label for="${campo.name}">${campo.name}: </label>\n`;
    //    form += `<input type="${campo.type}" id="${campo.name}" name="${campo.name}" size=${campo.size} value="${campo.value}"/>`;
    //  });
    //});
    //form += '<div hx-post="/updatePerson" >Atualizar</div></form>';
    return (
      <form>
        { cPerfil.map((campos:aCampo) => (
          campos.map((campo:tCampo) => (
            <>
            <label for="${campo.name}">{campo.name}: </label>
            <input type={campo.type}
                   id={campo.name}
                   name={campo.name}
                   placeholder={"Digite"}
                   label={campo.name}
                   size={campo.size}
                   value={campo.value}/>
            </>
          ))
        ))
        }
        <button type={"submit"} hx-post="/updatePerson">Altera</button>
      </form>
    )

  }