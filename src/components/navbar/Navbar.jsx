import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../assets/images/elohypelogo.png";
import { useAuth } from "../../context/AuthContext";


export default function Navbar() {

  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();


 const links = [
    {
        name:"Início",
        href:"/"
    },
    {
        name:"Serviços",
        href:"/#services"
    },
    {
        name:"Jogos",
        href:"/#games"
    },
    {
        name:"Como funciona",
        href:"/#how-it-works"
    }
];


  return (

    <motion.nav
      className={styles.navbar}

      initial={{
        y:-80,
        opacity:0
      }}

      animate={{
        y:0,
        opacity:1
      }}

      transition={{
        duration:.8
      }}
    >

      <div className={styles.container}>


        {/* LOGO */}

        <Link to="/" className={styles.logoArea}>

          <img
            src={logo}
            alt="Elo Hype"
            className={styles.logo}
          />

        </Link>



        {/* LINKS DESKTOP */}

        <div className={styles.links}>
{
  links.map(link=>(

    <Link
      to={link.href}
      key={link.name}
      onClick={()=>setOpen(false)}
    >

      {link.name}

    </Link>

  ))
}

        </div>



        {/* BOTÃO DESKTOP */}

        {
          user ? (
            <div className={styles.userArea}>
              <Link to="/dashboard" className={styles.button}>
                <LayoutDashboard size={18}/>
                Dashboard
              </Link>

              <button
                className={styles.logoutIcon}
                aria-label="Sair"
                onClick={signOut}
              >
                <LogOut size={18}/>
              </button>
            </div>
          ) : (
            <Link to="/entrar" className={styles.button}>
              Entrar
              <ArrowRight size={18}/>
            </Link>
          )
        }



        {/* MOBILE BUTTON */}

        <button
          className={styles.mobileButton}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={()=>setOpen(!open)}
        >

          {
            open ?
            <X size={28}/>
            :
            <Menu size={28}/>
          }

        </button>



      </div>



      {/* MENU MOBILE */}

      <AnimatePresence>

      {
        open && (

          <motion.div

            className={styles.mobileMenu}

            initial={{
              opacity:0,
              height:0
            }}

            animate={{
              opacity:1,
              height:"auto"
            }}

            exit={{
              opacity:0,
              height:0
            }}

          >
      {
  links.map(link=>(
    <Link
      to={link.href}
      key={link.name}
      onClick={()=>setOpen(false)}
    >
      {link.name}
    </Link>
  ))
}

            {
              user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={styles.mobileCTA}
                    onClick={()=>setOpen(false)}
                  >
                    <LayoutDashboard size={18}/>
                    Dashboard
                  </Link>

                  <button
                    className={styles.mobileLogout}
                    onClick={()=>{ setOpen(false); signOut(); }}
                  >
                    <LogOut size={18}/>
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/entrar"
                  className={styles.mobileCTA}
                  onClick={()=>setOpen(false)}
                >
                  Entrar
                  <ArrowRight size={18}/>
                </Link>
              )
            }


          </motion.div>

        )
      }

      </AnimatePresence>


    </motion.nav>

  )
}