/* Biblioteca técnica Macroservice — dados genéricos de catálogo para navegação e orçamento.
   A aplicação específica da peça deve ser confirmada por chassi/VIN, catálogo do fabricante ou código OEM. */

const VEHICLE_LIBRARY = {
  "Fiat":["147","Argo","Bravo","Cronos","Doblò","Ducato","Fiorino","Grand Siena","Idea","Linea","Marea","Mobi","Palio","Pulse","Punto","Siena","Stilo","Strada","Tempra","Tipo","Toro","Uno","Fastback","Titano"],
  "Volkswagen":["Amarok","Bora","CrossFox","Delivery","Fox","Fusca","Gol","Golf","Jetta","Kombi","Nivus","Parati","Passat","Polo","Saveiro","Santana","SpaceFox","T-Cross","Taos","Tiguan","Touareg","Up!","Virtus","Voyage"],
  "Chevrolet":["Agile","Astra","Blazer","C10","Celta","Classic","Cobalt","Corsa","Cruze","Equinox","Joy","Meriva","Montana","Monza","Onix","Opala","Prisma","S10","Sonic","Spin","Tracker","Trailblazer","Vectra","Zafira"],
  "Ford":["Belina","Bronco Sport","Cargo","Courier","EcoSport","Edge","Escort","F-1000","F-250","Fiesta","Focus","Fusion","Ka","Maverick","Mondeo","Mustang","Pampa","Ranger","Territory","Verona"],
  "Toyota":["Bandeirante","Camry","Corolla","Corolla Cross","Etios","Hilux","Prius","RAV4","SW4","Yaris"],
  "Nissan":["350Z","370Z","Altima","Frontier","Kicks","Livina","March","Pathfinder","Sentra","Tiida","Versa","X-Trail"],
  "Mitsubishi":["ASX","Airtrek","Eclipse Cross","L200","L200 Outdoor","L200 Sport","L200 Triton","Lancer","Outlander","Pajero","Pajero Dakar","Pajero Full","Pajero Sport","Pajero TR4"],
  "Hyundai":["Azera","Creta","Elantra","HB20","HB20S","HR","i30","ix35","Santa Fe","Sonata","Tucson","Veloster"],
  "Honda":["Accord","City","Civic","CR-V","Fit","HR-V","WR-V"],
  "Jeep":["Cherokee","Commander","Compass","Grand Cherokee","Renegade","Wrangler"],
  "Renault":["Captur","Clio","Duster","Fluence","Kangoo","Kardian","Kwid","Logan","Master","Megane","Oroch","Sandero","Scenic","Symbol"],
  "Peugeot":["106","206","207","208","2008","306","307","308","3008","405","406","408","5008","Boxer","Expert","Hoggar","Partner"],
  "Citroën":["Aircross","Berlingo","C3","C3 Aircross","C4","C4 Cactus","C4 Lounge","C5","C6","Jumper","Jumpy","Xsara Picasso"],
  "Caoa Chery":["Arrizo 5","Arrizo 6","Celer","Face","iCar","QQ","Tiggo 2","Tiggo 3X","Tiggo 5X","Tiggo 7","Tiggo 8"],
  "Mercedes-Benz":["A-Class","B-Class","C-Class","CLA","CLS","E-Class","G-Class","GLA","GLB","GLC","GLE","GLS","Sprinter","Vito"],
  "BMW":["Série 1","Série 2","Série 3","Série 4","Série 5","Série 7","X1","X2","X3","X4","X5","X6","X7","Z4"],
  "Audi":["A1","A3","A4","A5","A6","A7","A8","Q3","Q5","Q7","Q8","TT"],
  "Kia":["Besta","Carens","Carnival","Cerato","Mohave","Picanto","Rio","Sorento","Soul","Sportage","Stinger"],
  "Suzuki":["Grand Vitara","Jimny","S-Cross","Swift","Vitara","SX4"],
  "JAC":["E-JS1","E-JS4","iEV20","J2","J3","J5","J6","T40","T50","T60","T80"],
  "RAM":["1500","2500","3500","Rampage"],
  "Volvo":["C30","S40","S60","S80","V40","V60","XC40","XC60","XC90"],
  "Land Rover":["Defender","Discovery","Discovery Sport","Freelander","Range Rover","Range Rover Evoque","Range Rover Sport","Range Rover Velar"],
  "Subaru":["Forester","Impreza","Legacy","Outback","Tribeca","WRX","XV"],
  "Porsche":["718","911","Cayenne","Macan","Panamera","Taycan"],
  "Lexus":["ES","IS","NX","RX","UX"],
  "Mini":["Cooper","Countryman","Clubman","Paceman"],
  "Dodge":["Challenger","Charger","Dakota","Durango","Journey","Ram"],
  "Chrysler":["300C","Caravan","Neon","PT Cruiser","Town & Country"],
  "Troller":["T4","Pantanal"],
  "Iveco":["Daily","Eurocargo","S-Way","Tector"],
  "Agrale":["Marruá","MA","MT"],
  "BYD":["Dolphin","Dolphin Mini","Han","King","Seal","Song Plus","Tan","Yuan Plus"],
  "GWM":["Haval H6","Ora 03","Tank 300"],
  "Geely":["Coolray","Emgrand","GC2","EC7"],
  "Lifan":["320","530","620","X60","X80"],
  "Effa":["M100","Picape","Van"],
  "Shineray":["T20","T30","X30"],
  "Outra":["Outro modelo"]
};

const PART_CATALOG = {
  "Motor": {
    "Bloco / conjunto móvel":["Bloco do motor","Pistão","Jogo de pistões","Anel de pistão","Biela","Bronzina de biela","Bronzina de mancal","Virabrequim","Polia do virabrequim","Volante do motor","Cremalheira do volante","Bucha de biela","Pino do pistão","Bomba de óleo","Pescador de óleo","Cárter","Junta do cárter","Bujão do cárter","Sensor de nível de óleo"],
    "Cabeçote / válvulas":["Cabeçote","Junta do cabeçote","Parafuso do cabeçote","Eixo comando de válvulas","Tucho hidráulico","Balancim","Válvula de admissão","Válvula de escape","Guia de válvula","Sede de válvula","Retentor de válvula","Mola de válvula","Prato de mola","Chaveta de válvula","Tampa de válvulas","Junta da tampa de válvulas"],
    "Sincronismo":["Correia dentada","Corrente de comando","Tensor da correia dentada","Tensor da corrente","Guia da corrente","Patim da corrente","Engrenagem do comando","Engrenagem do virabrequim","Variador de fase","Polia do comando","Kit sincronismo"],
    "Admissão / escape":["Coletor de admissão","Junta do coletor de admissão","Coletor de escape","Junta do coletor de escape","Mangueira de admissão","Ressonador","Filtro de ar","Caixa do filtro de ar","Catalisador","Flexível do escapamento","Silencioso intermediário","Silencioso traseiro"]
  },
  "Ignição": {
    "Velas / cabos / bobinas":["Vela de ignição","Jogo de velas","Cabo de vela","Jogo de cabos de vela","Bobina de ignição individual","Bobina de ignição dupla","Bobina tipo régua","Módulo de ignição","Cachimbo de vela"],
    "Distribuidor":["Distribuidor","Tampa do distribuidor","Rotor do distribuidor","Sensor Hall","Platinado","Condensador de ignição"]
  },
  "Injeção Eletrônica / Combustível": {
    "Bicos / alimentação":["Bico injetor","Jogo de bicos injetores","Flauta de combustível","Regulador de pressão","Bomba de combustível","Módulo da bomba de combustível","Pré-filtro da bomba","Filtro de combustível","Mangueira de combustível","Tubo de combustível","Sensor de pressão de combustível","Bomba de alta pressão"],
    "Sensores":["Sensor MAP","Sensor MAF","Sensor TPS","Sensor ECT temperatura","Sensor IAT temperatura do ar","Sensor CKP rotação","Sensor CMP fase","Sensor de detonação","Sonda lambda pré-catalisador","Sonda lambda pós-catalisador","Sensor de pressão do rail","Sensor de pedal do acelerador"],
    "Atuadores":["Corpo de borboleta TBI","Motor de passo marcha lenta","Válvula IAC","Válvula canister","Eletroválvula de controle de turbo","Válvula EGR","Atuador de geometria da turbina"]
  },
  "Arrefecimento": {
    "Circuito":["Radiador","Reservatório de expansão","Tampa do reservatório","Mangueira superior do radiador","Mangueira inferior do radiador","Mangueira do ar quente","Bomba d'água","Válvula termostática","Carcaça da válvula termostática","Sensor de temperatura","Cebolão do radiador","Ventoinha","Motor da ventoinha","Eletroventilador","Módulo/resistor da ventoinha","Intercooler"]
  },
  "Lubrificação": {
    "Óleo":["Filtro de óleo","Óleo do motor","Interruptor de pressão de óleo","Sensor de pressão de óleo","Trocador de calor do óleo","Radiador de óleo","Junta do trocador de calor","Respiro do cárter","Válvula PCV"]
  },
  "Embreagem": {
    "Acionamento / conjunto":["Disco de embreagem","Platô de embreagem","Rolamento de embreagem","Kit de embreagem","Atuador hidráulico de embreagem","Cilindro mestre de embreagem","Cilindro auxiliar de embreagem","Garfo de embreagem","Cabo de embreagem","Volante bimassa"]
  },
  "Câmbio / Transmissão": {
    "Câmbio manual":["Caixa de câmbio","Eixo piloto","Eixo secundário","Engrenagem de marcha","Anel sincronizador","Luva sincronizadora","Garfo seletor","Trambulador","Cabo seletor de marchas","Rolamento de câmbio","Retentor de câmbio","Óleo de câmbio"],
    "Automático / CVT / DCT":["Conversor de torque","Corpo de válvulas","Solenoide de câmbio","Filtro de transmissão","Junta do cárter da transmissão","Óleo ATF","Fluido CVT","Kit de embreagem DCT","Módulo TCM","Bomba de óleo da transmissão"],
    "Semi-eixos / diferencial":["Semi-eixo","Junta homocinética externa","Junta homocinética interna","Trizeta","Tulipa","Coifa da homocinética","Rolamento de apoio do semi-eixo","Diferencial","Coroa e pinhão","Rolamento do diferencial","Cardan","Cruzeta do cardan","Mancal do cardan"]
  },
  "Suspensão": {
    "Dianteira":["Amortecedor dianteiro","Mola dianteira","Coxim do amortecedor","Rolamento do coxim","Batente do amortecedor","Coifa do amortecedor","Bandeja de suspensão","Bucha de bandeja","Pivô de suspensão","Bieleta","Barra estabilizadora","Bucha da barra estabilizadora","Agregado/subchassi","Manga de eixo"],
    "Traseira":["Amortecedor traseiro","Mola traseira","Coxim traseiro","Batente traseiro","Bucha do eixo traseiro","Braço de suspensão traseiro","Bucha do braço traseiro","Bieleta traseira","Barra estabilizadora traseira"]
  },
  "Direção": {
    "Sistema de direção":["Caixa de direção mecânica","Caixa de direção hidráulica","Caixa de direção elétrica","Bomba de direção hidráulica","Reservatório da direção","Mangueira de pressão da direção","Mangueira de retorno","Fluido de direção","Terminal de direção","Axial de direção","Ponteira de direção","Coluna de direção","Cruzeta da coluna","Motor da direção elétrica","Módulo EPS"]
  },
  "Freios": {
    "Dianteiro":["Pastilha de freio","Disco de freio","Pinça de freio","Pistão da pinça","Reparo da pinça","Flexível de freio"],
    "Traseiro":["Sapata de freio","Tambor de freio","Cilindro de roda","Regulador de freio traseiro","Cabo de freio de estacionamento","Pastilha de freio traseira","Disco traseiro","Pinça traseira"],
    "Hidráulico / ABS":["Cilindro mestre de freio","Servo-freio/hidrovácuo","Reservatório de fluido","Fluido de freio","Tubulação de freio","Módulo ABS","Unidade hidráulica ABS","Sensor ABS de roda","Roda fônica"]
  },
  "Elétrica / Eletrônica": {
    "Carga e partida":["Bateria","Alternador","Regulador de voltagem","Ponte retificadora","Rotor do alternador","Estator do alternador","Polia do alternador","Motor de partida","Automático do motor de partida","Bendix","Induzido do motor de partida","Porta-escovas","Cabo positivo da bateria","Cabo negativo/aterramento"],
    "Fusíveis / relés / chicote":["Fusível","Maxi fusível","Relé","Caixa de fusíveis","Chicote do motor","Chicote interno","Conector elétrico","Terminal elétrico","Aterramento"],
    "Módulos / rede":["ECU/PCM módulo do motor","BCM módulo de carroceria","TCM módulo do câmbio","IPC painel de instrumentos","Módulo ABS","Módulo airbag","Módulo de conforto","Gateway CAN","Chave de ignição","Comutador de ignição","Antena do imobilizador","Chave codificada"],
    "Iluminação":["Farol","Lanterna traseira","Farol de milha","Lâmpada halógena","Lâmpada LED","Reator xenon","Interruptor de luz","Chave de seta","Luz de freio","Luz de ré"]
  },
  "Ar-condicionado": {
    "Refrigeração / ventilação":["Compressor do ar-condicionado","Embreagem do compressor","Polia do compressor","Condensador","Evaporador","Filtro secador","Válvula de expansão","Tubo de orifício","Pressostato","Sensor de pressão do A/C","Sensor evaporador","Ventilador interno","Resistor do ventilador","Módulo do ventilador","Filtro de cabine","Mangueira de alta pressão","Mangueira de baixa pressão"]
  },
  "Rodas / Pneus / Borracharia": {
    "Rodas e pneus":["Pneu","Roda de aço","Roda de liga leve","Válvula de pneu","Sensor TPMS","Parafuso de roda","Porca de roda","Rolamento de roda","Cubo de roda"]
  },
  "Carroceria / Acessórios": {
    "Portas / vidros / travas":["Máquina de vidro","Motor de vidro elétrico","Interruptor de vidro","Fechadura de porta","Atuador de trava elétrica","Maçaneta interna","Maçaneta externa","Limitador de porta","Borracha de porta"],
    "Limpadores / lavador":["Palheta do limpador","Motor do limpador","Braço do limpador","Reservatório do lavador","Bomba do lavador","Esguicho do lavador"],
    "Som / alarme":["Rádio/multimídia","Alto-falante","Módulo amplificador","Alarme","Sirene de alarme","Sensor de presença","Câmera de ré","Sensor de estacionamento"]
  }
};

const SERVICE_CATALOG = {
  "Motor": {
    "Diagnóstico / testes":[
      ["Medição de compressão dos cilindros",1.0],["Teste de estanqueidade dos cilindros (leak-down)",1.5],["Medição de vácuo do motor",0.5],["Medição de pressão de óleo do motor",1.0],["Diagnóstico de ruído interno do motor",1.0]
    ],
    "Cabeçote":[["Remoção e instalação do cabeçote",8],["Troca da junta do cabeçote",8],["Troca de tampa/junta da tampa de válvulas",1.5],["Troca de retentores de válvulas",6],["Troca de tuchos/balancins",4],["Troca de comando de válvulas",4]],
    "Sincronismo":[["Troca de correia dentada",3],["Troca do kit correia dentada",3.5],["Troca de corrente de comando",6],["Sincronismo do motor",3],["Troca de tensor/guia de sincronismo",3]],
    "Parte inferior":[["Remoção e instalação do motor",10],["Retífica/montagem do motor",16],["Troca da bomba de óleo",5],["Troca da junta do cárter",2],["Troca de retentor do virabrequim",4],["Troca de coxim do motor",1.5]]
  },
  "Ignição": {
    "Velas / cabos / bobinas":[["Troca de velas de ignição",0.5],["Troca de cabos de velas",0.5],["Teste de velas e centelha",0.5],["Teste de cabos de ignição",0.5],["Teste de bobina de ignição",0.5],["Troca de bobina de ignição",0.5],["Diagnóstico de falha de ignição",1.0]],
    "Distribuidor":[["Revisão do distribuidor",1],["Troca de tampa/rotor do distribuidor",0.5],["Ajuste de ponto de ignição",1]]
  },
  "Injeção Eletrônica / Combustível": {
    "Bicos injetores":[["Limpeza e teste de bicos injetores",1.5],["Teste de vazão/equalização de bicos",1],["Teste de estanqueidade/gotejamento de bicos",1],["Teste de resistência elétrica dos bicos",0.5],["Teste do padrão de pulverização",1],["Troca de bicos injetores",1]],
    "Pressão / vazão de combustível":[["Medição de pressão da linha de combustível",0.7],["Medição de vazão da bomba de combustível",0.7],["Teste da bomba de combustível",1],["Troca da bomba de combustível",2],["Troca do filtro de combustível",0.7],["Teste de pressão do rail diesel/GDI",1]],
    "Sensores / atuadores":[["Diagnóstico de sensores e atuadores",1],["Teste de sensor MAP/MAF",0.7],["Teste de sensor de rotação/fase",1],["Teste de sonda lambda",1],["Limpeza do TBI/corpo de borboleta",1],["Troca do TBI/corpo de borboleta",1],["Adaptação/aprendizado do TBI",0.5],["Limpeza de válvula EGR",2],["Teste de controle da turbina",1.5]],
    "Scanner":[["Scanner / leitura de falhas",1],["Diagnóstico eletrônico completo",2],["Leitura de parâmetros em tempo real",1],["Teste de atuadores via scanner",1],["Apagar códigos e realizar reaprendizados",0.5]]
  },
  "Arrefecimento": {
    "Testes":[["Teste de pressão do sistema de arrefecimento",1],["Teste da tampa do reservatório/radiador",0.5],["Teste de CO₂ no sistema de arrefecimento",0.7],["Teste de válvula termostática",1],["Teste da ventoinha/eletroventilador",1]],
    "Manutenção":[["Troca do líquido de arrefecimento",1.5],["Limpeza do sistema de arrefecimento",2],["Troca do radiador",2],["Troca da bomba d'água",3],["Troca da válvula termostática",2],["Troca de mangueira do arrefecimento",1],["Troca do reservatório/tampa",0.5],["Troca do eletroventilador",1.5]]
  },
  "Lubrificação": {
    "Óleo e filtros":[["Troca de óleo do motor",0.5],["Troca de óleo e filtro",0.7],["Troca do filtro de óleo",0.5],["Limpeza do cárter/pescador",3],["Troca do sensor/interruptor de pressão de óleo",0.7]]
  },
  "Embreagem": {
    "Conjunto":[["Troca do kit de embreagem",4],["Troca do disco de embreagem",4],["Troca do platô de embreagem",4],["Troca do rolamento/atuador de embreagem",4],["Troca do volante bimassa",5],["Sangria do sistema de embreagem",0.7]],
    "Acionamento":[["Troca do cilindro mestre de embreagem",1.5],["Troca do cilindro auxiliar de embreagem",1.5],["Troca do cabo de embreagem",1],["Regulagem do pedal de embreagem",0.5]]
  },
  "Câmbio / Transmissão": {
    "Câmbio":[["Remoção e instalação da caixa de câmbio",5],["Reparo de câmbio manual",10],["Troca de óleo do câmbio manual",1],["Troca de fluido ATF",2],["Troca de fluido CVT",2],["Troca de filtro da transmissão automática",3],["Diagnóstico de câmbio automático/CVT",2]],
    "Semi-eixos / homocinéticas":[["Troca de junta homocinética",1.5],["Troca de coifa da homocinética",1.5],["Troca de trizeta",1.5],["Troca de tulipa",2],["Troca de semi-eixo",1.5],["Troca de rolamento de apoio do semi-eixo",2]],
    "Cardan / diferencial":[["Troca de cruzeta do cardan",2],["Troca de mancal do cardan",2],["Troca de óleo do diferencial",1],["Diagnóstico de diferencial",2]]
  },
  "Suspensão": {
    "Dianteira":[["Troca de amortecedores dianteiros",2],["Troca de mola dianteira",2],["Troca de coxim/rolamento do amortecedor",2],["Troca de batente/coifa do amortecedor",2],["Troca de bandeja",1.5],["Troca de buchas de bandeja",2],["Troca de pivô",1],["Troca de bieleta",0.7],["Troca de bucha da barra estabilizadora",1],["Troca de manga de eixo",2]],
    "Traseira":[["Troca de amortecedores traseiros",1.5],["Troca de molas traseiras",2],["Troca de buchas do eixo traseiro",4],["Troca de braço/bucha da suspensão traseira",2],["Troca de bieleta traseira",1]],
    "Diagnóstico":[["Diagnóstico de folgas na suspensão",1],["Inspeção completa da suspensão",1]]
  },
  "Direção": {
    "Terminais / caixa":[["Troca de terminal/ponteira de direção",1],["Troca de axial de direção",1.5],["Troca de caixa de direção",4],["Troca de coluna/cruzeta de direção",3]],
    "Hidráulica / elétrica":[["Troca da bomba de direção hidráulica",2],["Troca do fluido da direção hidráulica",1],["Reparo de vazamento da direção hidráulica",2],["Diagnóstico de direção elétrica EPS",1.5]]
  },
  "Freios": {
    "Dianteiro":[["Troca de pastilhas de freio",1],["Troca de discos de freio",1.5],["Reparo/troca de pinça de freio",1.5],["Troca de flexível de freio",1]],
    "Traseiro":[["Troca de sapatas de freio",1.5],["Troca de cilindros de roda",1.5],["Troca de tambores de freio",1.5],["Regulagem de freio traseiro",1],["Troca do cabo do freio de estacionamento",2]],
    "Hidráulico / ABS":[["Sangria do sistema de freio",1],["Troca do fluido de freio",1],["Troca do cilindro mestre",2],["Troca do servo-freio/hidrovácuo",3],["Diagnóstico ABS",1.5],["Troca de sensor ABS de roda",1]]
  },
  "Elétrica / Eletrônica": {
    "Bateria / carga":[["Teste de bateria / CCA",0.5],["Teste do sistema de carga",0.5],["Troca de bateria",0.3],["Troca de alternador",1.5],["Reparo de alternador",3],["Teste de alternador",0.7],["Teste de queda de tensão",1]],
    "Partida":[["Teste do sistema de partida",0.7],["Troca do motor de partida",1.5],["Reparo do motor de partida",3],["Troca de Bendix/automático",2]],
    "Chicote / alimentação":[["Teste de continuidade do chicote",1],["Diagnóstico de curto-circuito",2],["Reparo de chicote elétrico",2],["Teste de aterramentos",1],["Teste de fusíveis e relés",0.7],["Reparo de caixa de fusíveis",2]],
    "Módulos / rede CAN":[["Diagnóstico de rede CAN",2],["Diagnóstico de módulo eletrônico",2],["Codificação/adaptação de módulo",1.5],["Diagnóstico de imobilizador/chave",1.5]],
    "Iluminação / acessórios":[["Troca/reparo de farol",1],["Troca/reparo de lanterna",1],["Instalação de lâmpadas",0.5],["Instalação de som/multimídia",3],["Instalação de alarme",3],["Reparo de trava elétrica",1.5],["Reparo de vidro elétrico",1.5]]
  },
  "Ar-condicionado": {
    "Diagnóstico / testes":[["Diagnóstico do ar-condicionado",1.5],["Medição de pressão alta/baixa do A/C",0.7],["Teste elétrico do compressor",1],["Teste do sensor de pressão do A/C",1],["Teste de estanqueidade/vazamento do A/C",1.5]],
    "Manutenção":[["Recarga de gás refrigerante",1.5],["Troca do compressor do ar-condicionado",3],["Troca do condensador",2.5],["Troca do evaporador",6],["Troca da válvula de expansão",3],["Troca do filtro secador",2],["Higienização do ar-condicionado",1],["Troca do filtro de cabine",0.5]]
  },
  "Alinhamento / Geometria": {
    "Geometria":[["Alinhamento dianteiro",1],["Alinhamento 4 rodas",1.2],["Verificação de cambagem",0.7],["Correção de cambagem",1.5],["Verificação de caster",0.7],["Centralização do volante",0.5]]
  },
  "Balanceamento / Rodas": {
    "Rodas":[["Balanceamento de roda",0.3],["Balanceamento das 4 rodas",1],["Rodízio de pneus",0.7],["Troca de roda",0.3],["Troca de rolamento de roda",2],["Troca de cubo de roda",2]]
  },
  "Pneus / Borracharia": {
    "Borracharia":[["Desmontagem e montagem de pneu",0.3],["Reparo de pneu (macarrão)",0.3],["Reparo interno de pneu",0.5],["Troca de válvula do pneu",0.3],["Calibragem de pneus",0.2],["Diagnóstico de perda de pressão",0.5]]
  },
  "Lavagem / Higienização": {
    "Lavagem":[["Lavagem externa",1],["Lavagem completa",2],["Lavagem técnica de motor",1.5],["Lavagem de chassi/caixa de roda",1.5]],
    "Higienização":[["Higienização interna",3],["Higienização de bancos",3],["Limpeza de teto e forrações",2],["Oxi-sanitização",1]]
  },
  "Revisão Preventiva": {
    "Revisão":[["Revisão preventiva básica",2],["Revisão preventiva completa",4],["Checklist de viagem",2],["Inspeção pré-compra",3],["Inspeção de vazamentos",1],["Inspeção de correias e mangueiras",1],["Inspeção de níveis e fluidos",0.5]]
  }
};

function flattenServiceCatalog(){
  let id=10000, out=[];
  Object.entries(SERVICE_CATALOG).forEach(([categoria,subs])=>{
    Object.entries(subs).forEach(([subcategoria,items])=>{
      items.forEach(([nome,tempo])=>out.push({id:id++,catalogKey:`${categoria}|${subcategoria}|${nome}`,nome,tipo:categoria,subcategoria,valor:0,tempo:Number(tempo||1),catalogo:true}));
    });
  });
  return out;
}

function flattenPartCatalog(){
  let id=50000, out=[];
  Object.entries(PART_CATALOG).forEach(([categoria,subs])=>{
    Object.entries(subs).forEach(([subcategoria,items])=>{
      items.forEach(nome=>out.push({id:id++,catalogKey:`${categoria}|${subcategoria}|${nome}`,nome,categoria,subcategoria,valor:0,aplicacao:"Confirmar aplicação pelo veículo/chassi",catalogo:true}));
    });
  });
  return out;
}

const CATALOG_SERVICES = flattenServiceCatalog();
const CATALOG_PARTS = flattenPartCatalog();
const SERVICE_CATEGORIES = Object.keys(SERVICE_CATALOG);
const PART_CATEGORIES = Object.keys(PART_CATALOG);
