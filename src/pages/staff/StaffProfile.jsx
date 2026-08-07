import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Save, User } from "lucide-react";

import StaffHeader from "../../components/staffHeader/StaffHeader";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { ELOS } from "../../data/pricing";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import formStyles from "../../components/authLayout/AuthForm.module.css";
import styles from "./StaffProfile.module.css";

export default function StaffProfile() {
  useDocumentTitle("Meu perfil");

  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [discord, setDiscord] = useState(profile?.discord || "");
  const [nickLol, setNickLol] = useState(profile?.nick_lol || "");
  const [eloPeak, setEloPeak] = useState(profile?.elo_peak || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);

  async function handleFotoSelecionada(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      setErro("Escolha um arquivo de imagem.");
      return;
    }

    if (arquivo.size > 3 * 1024 * 1024) {
      setErro("A imagem precisa ter no máximo 3MB.");
      return;
    }

    setErro(null);
    setEnviandoFoto(true);

    const extensao = arquivo.name.split(".").pop();
    const caminho = `${user.id}/foto.${extensao}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(caminho, arquivo, { upsert: true });

    if (uploadError) {
      setErro("Não foi possível enviar a foto. Tente novamente.");
      setEnviandoFoto(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(caminho);
    // Adiciona um parâmetro pra forçar a atualização do cache da imagem
    const urlComVersao = `${data.publicUrl}?v=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ avatar_url: urlComVersao })
      .eq("id", user.id);

    setAvatarUrl(urlComVersao);
    await refreshProfile();
    setEnviandoFoto(false);
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setSalvando(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        nickname: nickname || null,
        discord: discord || null,
        nick_lol: nickLol || null,
        elo_peak: eloPeak || null
      })
      .eq("id", user.id);

    setSalvando(false);

    if (error) {
      setErro("Não foi possível salvar seu perfil. Tente novamente.");
      return;
    }

    await refreshProfile();
    setMensagem("Perfil atualizado!");
  }

  return (
    <>
      <StaffHeader />

      <main className={styles.page}>
        <div className={styles.container}>

          <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Meu perfil</h1>
            <p>Esses dados aparecem para o cliente assim que você assume um pedido.</p>
          </motion.div>

          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .1 }}
          >

            <div className={styles.avatarArea}>
              <div
                className={styles.avatar}
                role="button"
                tabIndex={0}
                aria-label="Trocar foto de perfil"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Sua foto de perfil" />
                ) : (
                  <User size={32} />
                )}

                <div className={styles.avatarOverlay}>
                  <Camera size={20} />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className={styles.trocarFoto}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={enviandoFoto}
                >
                  {enviandoFoto ? "Enviando..." : "Trocar foto"}
                </button>
                <p className={styles.avatarHint}>JPG ou PNG, até 3MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoSelecionada}
                hidden
              />
            </div>

            <form className={formStyles.form} onSubmit={handleSalvar}>

              {erro && <div className={formStyles.error}>{erro}</div>}
              {mensagem && <div className={styles.sucesso}>{mensagem}</div>}

              <div className={formStyles.field}>
                <label htmlFor="nickname">Nickname</label>
                <input
                  id="nickname"
                  type="text"
                  placeholder="Como você quer ser chamado"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={40}
                />
              </div>

              <div className={formStyles.field}>
                <label htmlFor="discord">Discord</label>
                <input
                  id="discord"
                  type="text"
                  placeholder="seunome"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  maxLength={40}
                />
              </div>

              <div className={formStyles.field}>
                <label htmlFor="nickLol">Nick da conta do LoL</label>
                <input
                  id="nickLol"
                  type="text"
                  placeholder="Nick#TAG"
                  value={nickLol}
                  onChange={(e) => setNickLol(e.target.value)}
                  maxLength={40}
                />
              </div>

              <div className={formStyles.field}>
                <label htmlFor="eloPeak">Elo peak</label>
                <select
                  id="eloPeak"
                  className={styles.select}
                  value={eloPeak}
                  onChange={(e) => setEloPeak(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {ELOS.map((elo) => (
                    <option key={elo} value={elo}>{elo}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className={formStyles.submit} disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar perfil"}
                <Save size={18} />
              </button>

            </form>
          </motion.div>

        </div>
      </main>
    </>
  );
}
