import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

import styles from "./Navbar.module.css";
import logo from "../../assets/images/elohypelogo.png";


export default function Navbar() {

  const [open, setOpen] = useState(false);


  const links = [
    "Início",
    "Serviços",
    "Jogos",
    "Como funciona",
    "Depoimentos"
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

        <div className={styles.logoArea}>

          <img
            src={logo}
            alt="Elo Hype"
            className={styles.logo}
          />

        </div>



        {/* LINKS DESKTOP */}

        <div className={styles.links}>

          {
            links.map(link=>(
              <a href="#" key={link}>
                {link}
              </a>
            ))
          }

        </div>



        {/* BOTÃO DESKTOP */}

        <button className={styles.button}>

          Começar Agora

          <ArrowRight size={18}/>

        </button>



        {/* MOBILE BUTTON */}

        <button
          className={styles.mobileButton}
          aria-label="Abrir menu"
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

                <a
                  href="#"
                  key={link}
                  onClick={()=>setOpen(false)}
                >

                  {link}

                </a>

              ))
            }



            <button className={styles.mobileCTA}>

              Começar Agora

              <ArrowRight size={18}/>

            </button>


          </motion.div>

        )
      }

      </AnimatePresence>


    </motion.nav>

  )
}