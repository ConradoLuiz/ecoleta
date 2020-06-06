import React from 'react';
import { useHistory, Link } from 'react-router-dom';

import { FiLogIn } from 'react-icons/fi';
import './Home.css';
import logo from '../../assets/logo.svg';

const Home = () => {
    return (
       <div id="page-home">
           <div className="content">
               <header>
                    <img src={logo} alt="Logo"/>
               </header>

               <main>
                   <h1>Seu marketplace de coleta de resíduos.</h1>
                   <p>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</p>

                   <Link to="/point/new">
                       <span>
                           <FiLogIn size={18}  />
                       </span>
                       <strong>Cadastre um ponto de coleta</strong>
                   </Link>
               </main>
           </div>
       </div>
    )
}

export default Home;
