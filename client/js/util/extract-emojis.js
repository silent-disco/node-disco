var transform = require('lodash/object/transform');

var EMOJIS = {
    ':-)': 'smiley',
    ':-D': 'grinning',
    ';-)': 'wink',
    'O_o': 'flushed',
    '0_o': 'flushed',
    ':-o': 'hushed',
    ':-O': 'open_mouth',
    ':-P': 'stuck_out_tongue',
    ';-P': 'stuck_out_tongue_closed_eyes',
    ':-|': 'neutral_face',
    '<3': 'heart',
    ':-(': 'worried',
    ':-((': 'disappointed',
    smile: 1,laughing: 1,blush: 1,smiley: 1,relaxed: 1,smirk: 1,heart_eyes: 1,kissing_heart: 1,kissing_closed_eyes: 1,flushed: 1,relieved: 1,satisfied: 1,grin: 1,wink: 1,stuck_out_tongue_winking_eye: 1,stuck_out_tongue_closed_eyes: 1,grinning: 1,kissing: 1,kissing_smiling_eyes: 1,stuck_out_tongue: 1,sleeping: 1,worried: 1,frowning: 1,anguished: 1,open_mouth: 1,grimacing: 1,confused: 1,hushed: 1,expressionless: 1,unamused: 1,sweat_smile: 1,sweat: 1,weary: 1,pensive: 1,disappointed: 1,confounded: 1,fearful: 1,cold_sweat: 1,persevere: 1,cry: 1,sob: 1,joy: 1,astonished: 1,scream: 1,tired_face: 1,angry: 1,rage: 1,triumph: 1,sleepy: 1,yum: 1,mask: 1,sunglasses: 1,dizzy_face: 1,imp: 1,smiling_imp: 1,neutral_face: 1,no_mouth: 1,innocent: 1,alien: 1,yellow_heart: 1,blue_heart: 1,purple_heart: 1,heart: 1,green_heart: 1,broken_heart: 1,heartbeat: 1,heartpulse: 1,two_hearts: 1,revolving_hearts: 1,cupid: 1,sparkling_heart: 1,sparkles: 1,star: 1,star2: 1,dizzy: 1,boom: 1,anger: 1,exclamation: 1,question: 1,grey_exclamation: 1,grey_question: 1,zzz: 1,dash: 1,sweat_drops: 1,notes: 1,musical_note: 1,fire: 1,poop: 1,thumbsup: 1,thumbsdown: 1,ok_hand: 1,punch: 1,fist: 1,v: 1,wave: 1,hand: 1,open_hands: 1,point_up: 1,point_down: 1,point_left: 1,point_right: 1,raised_hands: 1,pray: 1,point_up_2: 1,clap: 1,muscle: 1,walking: 1,runner: 1,couple: 1,family: 1,two_men_holding_hands: 1,two_women_holding_hands: 1,dancer: 1,dancers: 1,ok_woman: 1,no_good: 1,information_desk_person: 1,raised_hand: 1,bride_with_veil: 1,person_with_pouting_face: 1,person_frowning: 1,bow: 1,couplekiss: 1,couple_with_heart: 1,massage: 1,haircut: 1,nail_care: 1,boy: 1,girl: 1,woman: 1,man: 1,baby: 1,older_woman: 1,older_man: 1,person_with_blond_hair: 1,man_with_gua_pi_mao: 1,man_with_turban: 1,construction_worker: 1,cop: 1,angel: 1,princess: 1,smiley_cat: 1,smile_cat: 1,heart_eyes_cat: 1,kissing_cat: 1,smirk_cat: 1,scream_cat: 1,crying_cat_face: 1,joy_cat: 1,pouting_cat: 1,japanese_ogre: 1,japanese_goblin: 1,see_no_evil: 1,hear_no_evil: 1,speak_no_evil: 1,guardsman: 1,skull: 1,feet: 1,lips: 1,kiss: 1,droplet: 1,ear: 1,eyes: 1,nose: 1,tongue: 1,love_letter: 1,bust_in_silhouette: 1,busts_in_silhouette: 1,speech_balloon: 1,thought_balloon: 1,sunny: 1,umbrella: 1,cloud: 1,snowflake: 1,snowman: 1,zap: 1,cyclone: 1,foggy: 1,ocean: 1,cat: 1,dog: 1,mouse: 1,hamster: 1,rabbit: 1,wolf: 1,frog: 1,tiger: 1,koala: 1,bear: 1,pig: 1,pig_nose: 1,cow: 1,boar: 1,monkey_face: 1,monkey: 1,horse: 1,racehorse: 1,camel: 1,sheep: 1,elephant: 1,panda_face: 1,snake: 1,bird: 1,baby_chick: 1,hatched_chick: 1,hatching_chick: 1,chicken: 1,penguin: 1,turtle: 1,bug: 1,honeybee: 1,ant: 1,beetle: 1,snail: 1,octopus: 1,tropical_fish: 1,fish: 1,whale: 1,whale2: 1,dolphin: 1,cow2: 1,ram: 1,rat: 1,water_buffalo: 1,tiger2: 1,rabbit2: 1,dragon: 1,goat: 1,rooster: 1,dog2: 1,pig2: 1,mouse2: 1,ox: 1,dragon_face: 1,blowfish: 1,crocodile: 1,dromedary_camel: 1,leopard: 1,cat2: 1,poodle: 1,paw_prints: 1,bouquet: 1,cherry_blossom: 1,tulip: 1,four_leaf_clover: 1,rose: 1,sunflower: 1,hibiscus: 1,maple_leaf: 1,leaves: 1,fallen_leaf: 1,herb: 1,mushroom: 1,cactus: 1,palm_tree: 1,evergreen_tree: 1,deciduous_tree: 1,chestnut: 1,seedling: 1,blossom: 1,ear_of_rice: 1,shell: 1,globe_with_meridians: 1,sun_with_face: 1,full_moon_with_face: 1,new_moon_with_face: 1,new_moon: 1,waxing_crescent_moon: 1,first_quarter_moon: 1,waxing_gibbous_moon: 1,full_moon: 1,waning_gibbous_moon: 1,last_quarter_moon: 1,waning_crescent_moon: 1,last_quarter_moon_with_face: 1,first_quarter_moon_with_face: 1,moon: 1,earth_africa: 1,earth_americas: 1,earth_asia: 1,volcano: 1,milky_way: 1,partly_sunny: 1,bamboo: 1,gift_heart: 1,dolls: 1,school_satchel: 1,mortar_board: 1,flags: 1,fireworks: 1,sparkler: 1,wind_chime: 1,rice_scene: 1,jack_o_lantern: 1,ghost: 1,santa: 1,'8ball': 1,alarm_clock: 1,apple: 1,art: 1,baby_bottle: 1,balloon: 1,banana: 1,bar_chart: 1,baseball: 1,basketball: 1,bath: 1,bathtub: 1,battery: 1,beer: 1,beers: 1,bell: 1,bento: 1,bicyclist: 1,bikini: 1,birthday: 1,black_joker: 1,black_nib: 1,blue_book: 1,bomb: 1,bookmark: 1,bookmark_tabs: 1,books: 1,boot: 1,bowling: 1,bread: 1,briefcase: 1,bulb: 1,cake: 1,calendar: 1,calling: 1,camera: 1,candy: 1,card_index: 1,cd: 1,chart_with_downwards_trend: 1,chart_with_upwards_trend: 1,cherries: 1,chocolate_bar: 1,christmas_tree: 1,clapper: 1,clipboard: 1,closed_book: 1,closed_lock_with_key: 1,closed_umbrella: 1,clubs: 1,cocktail: 1,coffee: 1,computer: 1,confetti_ball: 1,cookie: 1,corn: 1,credit_card: 1,crown: 1,crystal_ball: 1,curry: 1,custard: 1,dango: 1,dart: 1,date: 1,diamonds: 1,dollar: 1,door: 1,doughnut: 1,dress: 1,dvd: 1,e_mail: 1,egg: 1,eggplant: 1,electric_plug: 1,email: 1,euro: 1,eyeglasses: 1,fax: 1,file_folder: 1,fish_cake: 1,fishing_pole_and_fish: 1,flashlight: 1,floppy_disk: 1,flower_playing_cards: 1,football: 1,fork_and_knife: 1,fried_shrimp: 1,fries: 1,game_die: 1,gem: 1,gift: 1,golf: 1,grapes: 1,green_apple: 1,green_book: 1,guitar: 1,gun: 1,hamburger: 1,hammer: 1,handbag: 1,headphones: 1,hearts: 1,high_brightness: 1,high_heel: 1,hocho: 1,honey_pot: 1,horse_racing: 1,hourglass: 1,hourglass_flowing_sand: 1,ice_cream: 1,icecream: 1,inbox_tray: 1,incoming_envelope: 1,iphone: 1,jeans: 1,key: 1,kimono: 1,ledger: 1,lemon: 1,lipstick: 1,lock: 1,lock_with_ink_pen: 1,lollipop: 1,loop: 1,loudspeaker: 1,low_brightness: 1,mag: 1,mag_right: 1,mahjong: 1,mailbox: 1,mailbox_closed: 1,mailbox_with_mail: 1,mailbox_with_no_mail: 1,mans_shoe: 1,meat_on_bone: 1,mega: 1,melon: 1,memo: 1,microphone: 1,microscope: 1,minidisc: 1,money_with_wings: 1,moneybag: 1,mountain_bicyclist: 1,movie_camera: 1,musical_keyboard: 1,musical_score: 1,mute: 1,name_badge: 1,necktie: 1,newspaper: 1,no_bell: 1,notebook: 1,notebook_with_decorative_cover: 1,nut_and_bolt: 1,oden: 1,open_file_folder: 1,orange_book: 1,outbox_tray: 1,page_facing_up: 1,page_with_curl: 1,pager: 1,paperclip: 1,peach: 1,pear: 1,pencil2: 1,phone: 1,pill: 1,pineapple: 1,pizza: 1,postal_horn: 1,postbox: 1,pouch: 1,poultry_leg: 1,pound: 1,purse: 1,pushpin: 1,radio: 1,ramen: 1,ribbon: 1,rice: 1,rice_ball: 1,rice_cracker: 1,ring: 1,rugby_football: 1,running_shirt_with_sash: 1,sake: 1,sandal: 1,satellite: 1,saxophone: 1,scissors: 1,scroll: 1,seat: 1,shaved_ice: 1,shirt: 1,shower: 1,ski: 1,smoking: 1,snowboarder: 1,soccer: 1,sound: 1,space_invader: 1,spades: 1,spaghetti: 1,speaker: 1,stew: 1,straight_ruler: 1,strawberry: 1,surfer: 1,sushi: 1,sweet_potato: 1,swimmer: 1,syringe: 1,tada: 1,tanabata_tree: 1,tangerine: 1,tea: 1,telephone_receiver: 1,telescope: 1,tennis: 1,toilet: 1,tomato: 1,tophat: 1,triangular_ruler: 1,trophy: 1,tropical_drink: 1,trumpet: 1,tv: 1,unlock: 1,vhs: 1,video_camera: 1,video_game: 1,violin: 1,watch: 1,watermelon: 1,wine_glass: 1,womans_clothes: 1,womans_hat: 1,wrench: 1,yen: 1,aerial_tramway: 1,airplane: 1,ambulance: 1,anchor: 1,articulated_lorry: 1,atm: 1,bank: 1,barber: 1,beginner: 1,bike: 1,blue_car: 1,boat: 1,bridge_at_night: 1,bullettrain_front: 1,bullettrain_side: 1,bus: 1,busstop: 1,car: 1,carousel_horse: 1,checkered_flag: 1,church: 1,circus_tent: 1,city_sunrise: 1,city_sunset: 1,construction: 1,convenience_store: 1,crossed_flags: 1,department_store: 1,european_castle: 1,european_post_office: 1,factory: 1,ferris_wheel: 1,fire_engine: 1,fountain: 1,fuelpump: 1,helicopter: 1,hospital: 1,hotel: 1,hotsprings: 1,house: 1,house_with_garden: 1,japan: 1,japanese_castle: 1,light_rail: 1,love_hotel: 1,minibus: 1,monorail: 1,mount_fuji: 1,mountain_cableway: 1,mountain_railway: 1,moyai: 1,office: 1,oncoming_automobile: 1,oncoming_bus: 1,oncoming_police_car: 1,oncoming_taxi: 1,performing_arts: 1,police_car: 1,post_office: 1,railway_car: 1,rainbow: 1,rocket: 1,roller_coaster: 1,rotating_light: 1,round_pushpin: 1,rowboat: 1,school: 1,ship: 1,slot_machine: 1,speedboat: 1,stars: 1,station: 1,statue_of_liberty: 1,steam_locomotive: 1,sunrise: 1,sunrise_over_mountains: 1,suspension_railway: 1,taxi: 1,tent: 1,ticket: 1,tokyo_tower: 1,tractor: 1,traffic_light: 1,train2: 1,tram: 1,triangular_flag_on_post: 1,trolleybus: 1,truck: 1,vertical_traffic_light: 1,warning: 1,wedding: 1,jp: 1,kr: 1,cn: 1,us: 1,fr: 1,es: 1,it: 1,ru: 1,gb: 1,de: 1,100: 1,1234: 1,a: 1,ab: 1,abc: 1,abcd: 1,accept: 1,aquarius: 1,aries: 1,arrow_backward: 1,arrow_double_down: 1,arrow_double_up: 1,arrow_down: 1,arrow_down_small: 1,arrow_forward: 1,arrow_heading_down: 1,arrow_heading_up: 1,arrow_left: 1,arrow_lower_left: 1,arrow_lower_right: 1,arrow_right: 1,arrow_right_hook: 1,arrow_up: 1,arrow_up_down: 1,arrow_up_small: 1,arrow_upper_left: 1,arrow_upper_right: 1,arrows_clockwise: 1,arrows_counterclockwise: 1,b: 1,baby_symbol: 1,baggage_claim: 1,ballot_box_with_check: 1,bangbang: 1,black_circle: 1,black_square_button: 1,cancer: 1,capital_abcd: 1,capricorn: 1,chart: 1,children_crossing: 1,cinema: 1,cl: 1,clock1: 1,clock10: 1,clock1030: 1,clock11: 1,clock1130: 1,clock12: 1,clock1230: 1,clock130: 1,clock2: 1,clock230: 1,clock3: 1,clock330: 1,clock4: 1,clock430: 1,clock5: 1,clock530: 1,clock6: 1,clock630: 1,clock7: 1,clock730: 1,clock8: 1,clock830: 1,clock9: 1,clock930: 1,congratulations: 1,cool: 1,copyright: 1,curly_loop: 1,currency_exchange: 1,customs: 1,diamond_shape_with_a_dot_inside: 1,do_not_litter: 1,eight: 1,eight_pointed_black_star: 1,eight_spoked_asterisk: 1,end: 1,fast_forward: 1,five: 1,four: 1,free: 1,gemini: 1,hash: 1,heart_decoration: 1,heavy_check_mark: 1,heavy_division_sign: 1,heavy_dollar_sign: 1,heavy_minus_sign: 1,heavy_multiplication_x: 1,heavy_plus_sign: 1,id: 1,ideograph_advantage: 1,information_source: 1,interrobang: 1,keycap_ten: 1,koko: 1,large_blue_circle: 1,large_blue_diamond: 1,large_orange_diamond: 1,left_luggage: 1,left_right_arrow: 1,leftwards_arrow_with_hook: 1,leo: 1,libra: 1,link: 1,m: 1,mens: 1,metro: 1,mobile_phone_off: 1,negative_squared_cross_mark: 1,new: 1,ng: 1,nine: 1,no_bicycles: 1,no_entry: 1,no_entry_sign: 1,no_mobile_phones: 1,no_pedestrians: 1,no_smoking: 1,non_potable_water: 1,o: 1,o2: 1,ok: 1,on: 1,one: 1,ophiuchus: 1,parking: 1,part_alternation_mark: 1,passport_control: 1,pisces: 1,potable_water: 1,put_litter_in_its_place: 1,radio_button: 1,recycle: 1,red_circle: 1,registered: 1,repeat: 1,repeat_one: 1,restroom: 1,rewind: 1,sa: 1,sagittarius: 1,scorpius: 1,secret: 1,seven: 1,signal_strength: 1,six: 1,six_pointed_star: 1,small_blue_diamond: 1,small_orange_diamond: 1,small_red_triangle: 1,small_red_triangle_down: 1,soon: 1,sos: 1,symbols: 1,taurus: 1,three: 1,tm: 1,top: 1,trident: 1,twisted_rightwards_arrows: 1,two: 1,u5272: 1,u5408: 1,u55b6: 1,u6307: 1,u6708: 1,u6709: 1,u6e80: 1,u7121: 1,u7533: 1,u7981: 1,u7a7a: 1,underage: 1,up: 1,vibration_mode: 1,virgo: 1,vs: 1,wavy_dash: 1,wc: 1,wheelchair: 1,white_check_mark: 1,white_circle: 1,white_flower: 1,white_square_button: 1,womens: 1,x: 1,zero: 1},
    EMOJI_REGEX = /(?:\:[a-z0-9_\-\+]+\:)|(?:[\:;0O8<]{1}[\S]{0,2}[\)\(\|oODd3Pp]{1})/g;


/**
 * Returns a list of { text: ... }, { emoji: ... } parts extracted
 * from the given text or part list.
 *
 * @param {Array<Object>|String} parts
 *
 * @return {Array<Object>}
 */
function extractEmojis(parts) {

  if (typeof parts === 'string') {
    parts = [ {
      text: parts
    } ];
  }

  return transform(parts, function(newParts, part) {

    var text = part.text;

    if (text) {
      var emojis = text.match(EMOJI_REGEX);

      var lastIdx = 0,
          idx = 0;

      (emojis || []).forEach(function(match) {

        var emoji = match.replace(/^\:(.*)\:$/, '$1');

        var symbol = EMOJIS[emoji];

        if (symbol === 1) {
          symbol = emoji;
        }

        idx = text.indexOf(match, lastIdx);

        if (symbol) {
          if (lastIdx < idx) {
            newParts.push({ text: text.substring(lastIdx, idx) });
          }

          newParts.push({ emoji: symbol.replace(/_/g, '-') });

          lastIdx = idx + match.length;
        }
      });

      if (lastIdx < text.length) {
        newParts.push({ text: text.substring(lastIdx) });
      }
    } else {
      newParts.push(part);
    }
  });
}

module.exports = extractEmojis;