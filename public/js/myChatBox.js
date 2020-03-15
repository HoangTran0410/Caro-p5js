function setupMyChatBox() {
    setupEmoji_MCB();
    showEmoji_MCB();

    let from = {
        name: 'Hoang Tran',
        avatar: 'https://avatars3.githubusercontent.com/u/8141770'
    }

    addMessage_MCB('conv-world', from, 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laborum molestias in inventore impedit, nemo quasi quaerat. Quas veniam, facilis et ex sequi porro. Neque, corporis delectus saepe cumque hic doloribus.');
}

function setupEmoji_MCB() {
    updateFrequentlyFromLocal();

    // check click outside emoji container => close emoji picker
    $(document).on('click', function(e) {
        let emojiPicker = document.getElementById('emoji-picker');
        if (!emojiPicker.contains(e.target)) {
            emojiPicker.classList.remove("active");
        }
    })

    // check click to emoji icon
    $(document).on('click', '.emoji', function(e) {
        let inp = $('#input-message');
        let currentMes = inp.val();
        let emojiValue = $(this).html();
        inp.val(currentMes + emojiValue);

        saveFrequentlyToLocal($(this).attr('title'), emojiValue);
    })

    // check click to small title emoji => open emoji inside
    $(document).on('click', '.emoji-picker-group-small-title', function(e) {
        addEmoji_MCB(e.target);
    })

    // check click to big title emoji => open small title emoji inside
    $(document).on('click', '.emoji-picker-group-title', function(e) {
        $(this).next('.emoji-picker-container-group-small').toggleClass('hide');
    })

    // check click button conversation chat
    $(document).on('click', '#btns-choose-conv button', function(e) {
        let dataConv = $(this).attr('data-conv');
        if (dataConv) {
            openChat_MCB($(this));
        }
    })

    // enter while typing
    $(document).on('keyup', '#input-message', function(event) {
        // If the user has pressed enter
        if (event.keyCode === 13) {
            $('#btn-send-message').click();
        }
    })

    // click button send
    $(document).on('click', '#btn-send-message', function() {
        sendMessage_MCB();
    })

    // click button close
    $(document).on('click', '#btn-close-chat', function() {
        $('.chat-container').removeClass('active');
    })

    // click button open/hide chat
    $(document).on('click', '#btn-open-chat', function() {
        $('.chat-container').toggleClass('active');
    })

    $(document).on('click', '#btn-emoji-picker', function(e) {
        e.stopPropagation();
        $('#emoji-picker').toggleClass("active");
    })

    $(document).on('keyup', '.emoji-input-search', function() {
        let emojies = document.getElementsByClassName('emoji-picker-group-small-title');

        let value = $(this).val();

        for (let e of emojies) {
            if (e.innerHTML.indexOf(value) < 0)
                e.style.display = 'none';
            else e.style.display = 'block';
        }
    })
}

function openChat_MCB(btn) {
    // close all actived button
    let group_btn_conv = $('#btns-choose-conv button').removeClass('active');
    btn.addClass('active');

    // close all conversation opened
    let convs = $('.conversation').removeClass('active');
    let idConv = btn.attr('data-conv');

    $('#' + idConv).addClass('active');
}

function sendMessage_MCB() {
    let inp = $('#input-message');
    let mes = inp.val();

    if (mes.trim() != '') {
        let conversation = $('.conversation.active').attr('id');

        addMessage_MCB(conversation, {
            name: "Hoang Tran",
            avatar: "https://avatars3.githubusercontent.com/u/8141770"
        }, mes, (Math.random() > .5 ? 'right' : 'left'));

        updateFrequentlyFromLocal();
    }

    inp.val('');
}

function addMessage_MCB(containerID, from, mes) {
    let div = $('<div class="message-container"></div>');

    div.html(`<div class="message-avatar">
                <img src="` + from.avatar + `" alt="">
            </div>
            <div class="message-body">
                <p class="message-title">
                    <b>` + from.name + `</b> 
                    <small> ` + (new Date().getDateTimeFormatted()) + `</small>
                </p>
                <p>` + mes + `</p>
            </div>
            <div class="clearFloat"></div>`);

    $('#' + containerID).append(div);

    // animate
    let container = $('#' + containerID);
    container.animate({
        scrollTop: container.prop("scrollHeight")
    }, 1000);
}

Date.prototype.getDateTimeFormatted = function() {
    let hour = this.getHours();
    let minute = this.getMinutes();
    let second = this.getSeconds();
    let day = this.getDate();
    let month = this.getMonth()+1;

    let output = 
        (day<10 ? '0' : '') + day + '/' +
        (month<10 ? '0' : '') + month + '/' + 
        this.getFullYear() + ' - ' +
        (hour<10 ? '0' : '') + hour + ':' +
        (minute<10 ? '0' : '') + minute + ':' +
        (second<10 ? '0' : '') + second;

    return output;
}

// ========================= Emoji =======================
// this func use to get emoji from wwebsite : https://unicode.org/emoji/charts/full-emoji-list.html
function getEmoji_MCB() {
    let trs = document.getElementsByTagName('table')[0].getElementsByTagName('tr');
    let result = {};
    let bigname, smallname;

    for (let tr of trs) {
        let th = tr.getElementsByTagName('th');
        let td = tr.getElementsByTagName('td');

        if (th && th[0]) {
            let size = th[0].classList[0];
            switch (size) {
                case 'bighead':
                    bigname = th[0].getElementsByTagName('a')[0].innerHTML.replace('&amp;', '&');
                    console.log(bigname);
                    result[bigname] = {};
                    break;
                case 'mediumhead':
                    smallname = th[0].getElementsByTagName('a')[0].innerHTML.replace('&amp;', '&');
                    console.log(smallname);
                    result[bigname][smallname] = {};
                    break;
            }
        } else if (td && td[0]) {
            let code = td[2].innerHTML;
            let name = td[14].innerHTML;

            result[bigname][smallname][code] = name;
        }
    }
}

function showEmoji_MCB() {
    let s = '';
    for (let bighead in emojiJSON) {
        s += ('<div class="emoji-picker-group">');
        s += ('<div class="emoji-picker-group-title">' + bighead + '</div>');

        s += ('<div class="emoji-picker-container-group-small hide">');

        for (let smallhead in emojiJSON[bighead]) {
            s += (`<p class="emoji-picker-group-small-title">` + smallhead + `</p>
                            <div class="emoji-container"></div>`);
        }

        s += ('</div>');
        s += ('</div>');
    }

    let picker_groups = $('.emoji-picker-groups');
    let currentHTML = picker_groups.html();
    picker_groups.html(currentHTML + s);
}

function addEmoji_MCB(p) {
    window.event.stopPropagation();

    let div = p.nextElementSibling;
    let bighead = p.parentElement.parentElement.firstChild.innerHTML.trim().replace('&amp;', '&');
    let smallhead = p.innerHTML.trim().replace('&amp;', '&');

    let s = '';
    if (div.innerHTML == s) {
        for (let emoji in emojiJSON[bighead][smallhead]) {
            s += (`<span class="emoji" title="` + emojiJSON[bighead][smallhead][emoji] + `">` + emoji + `</span>`);
        }

        div.innerHTML = s;
    } else {
        div.innerHTML = s;
    }
}

function updateFrequentlyFromLocal() {
    let frequently = window.localStorage.getItem('emoji-frequently');

    if (frequently) {
        let s = ('<div class="emoji-picker-group-title">Frequently used</div>');

        let emojis_fre = JSON.parse(frequently);
        for (let e of emojis_fre) {
            s += (`<span class="emoji" title="` + e.name + `">` + e.code + `</span>`);
        }

        $('#frequently-used').html(s);
    }
}

function saveFrequentlyToLocal(title, code) {
    let frequently = window.localStorage.getItem('emoji-frequently');
    if (!frequently) frequently = [];
    else frequently = JSON.parse(frequently);

    let newEmo = {
        "name": title,
        "code": code
    };

    for (let f of frequently) {
        if (f.code == newEmo.code) return;
    }

    frequently.unshift(newEmo);

    if (frequently.length > 12) frequently.pop();
    window.localStorage.setItem('emoji-frequently', JSON.stringify(frequently));
}

let emojiJSON={"Smileys & Emotion":{"face-smiling":{"😀":"grinning face","😃":"grinning face with big eyes","😄":"grinning face with smiling eyes","😁":"beaming face with smiling eyes","😆":"grinning squinting face","😅":"grinning face with sweat","🤣":"rolling on the floor laughing","😂":"face with tears of joy","🙂":"slightly smiling face","🙃":"upside-down face","😉":"winking face","😊":"smiling face with smiling eyes","😇":"smiling face with halo"},"face-affection":{"😍":"smiling face with heart-eyes","🤩":"star-struck","😘":"face blowing a kiss","😗":"kissing face","😚":"kissing face with closed eyes","😙":"kissing face with smiling eyes"},"face-tongue":{"😋":"face savoring food","😛":"face with tongue","😜":"winking face with tongue","🤪":"zany face","😝":"squinting face with tongue","🤑":"money-mouth face"},"face-hand":{"🤗":"hugging face","🤭":"face with hand over mouth","🤫":"shushing face","🤔":"thinking face"},"face-neutral-skeptical":{"🤐":"zipper-mouth face","🤨":"face with raised eyebrow","😐":"neutral face","😑":"expressionless face","😶":"face without mouth","😏":"smirking face","😒":"unamused face","🙄":"face with rolling eyes","😬":"grimacing face","🤥":"lying face"},"face-sleepy":{"😌":"relieved face","😔":"pensive face","😪":"sleepy face","🤤":"drooling face","😴":"sleeping face"},"face-unwell":{"😷":"face with medical mask","🤒":"face with thermometer","🤕":"face with head-bandage","🤢":"nauseated face","🤮":"face vomiting","🤧":"sneezing face","😵":"dizzy face","🤯":"exploding head"},"face-hat":{"🤠":"cowboy hat face"},"face-glasses":{"😎":"smiling face with sunglasses","🤓":"nerd face","🧐":"face with monocle"},"face-concerned":{"😕":"confused face","😟":"worried face","🙁":"slightly frowning face","☹":"frowning face","😮":"face with open mouth","😯":"hushed face","😲":"astonished face","😳":"flushed face","😦":"frowning face with open mouth","😧":"anguished face","😨":"fearful face","😰":"anxious face with sweat","😥":"sad but relieved face","😢":"crying face","😭":"loudly crying face","😱":"face screaming in fear","😖":"confounded face","😣":"persevering face","😞":"disappointed face","😓":"downcast face with sweat","😩":"weary face","😫":"tired face"},"face-negative":{"😤":"face with steam from nose","😡":"pouting face","😠":"angry face","🤬":"face with symbols on mouth","😈":"smiling face with horns","👿":"angry face with horns","💀":"skull","☠":"skull and crossbones"},"face-costume":{"💩":"pile of poo","🤡":"clown face","👹":"ogre","👺":"goblin","👻":"ghost","👽":"alien","👾":"alien monster","🤖":"robot"},"cat-face":{"😺":"grinning cat","😸":"grinning cat with smiling eyes","😹":"cat with tears of joy","😻":"smiling cat with heart-eyes","😼":"cat with wry smile","😽":"kissing cat","🙀":"weary cat","😿":"crying cat","😾":"pouting cat"},"monkey-face":{"🙈":"see-no-evil monkey","🙉":"hear-no-evil monkey","🙊":"speak-no-evil monkey"},emotion:{"💋":"kiss mark","💌":"love letter","💘":"heart with arrow","💝":"heart with ribbon","💖":"sparkling heart","💗":"growing heart","💓":"beating heart","💞":"revolving hearts","💕":"two hearts","💟":"heart decoration","❣":"heart exclamation","💔":"broken heart","❤":"red heart","🧡":"orange heart","💛":"yellow heart","💚":"green heart","💙":"blue heart","💜":"purple heart","🖤":"black heart","💯":"hundred points","💢":"anger symbol","💥":"collision","💫":"dizzy","💦":"sweat droplets","💨":"dashing away","🕳":"hole","💣":"bomb","💬":"speech balloon","👁️‍🗨️":"eye in speech bubble","🗨":"left speech bubble","🗯":"right anger bubble","💭":"thought balloon","💤":"zzz"}},"People & Body":{"hand-fingers-open":{"👋":"waving hand","🤚":"raised back of hand","🖐":"hand with fingers splayed","✋":"raised hand","🖖":"vulcan salute"},"hand-fingers-partial":{"👌":"OK hand","✌":"victory hand","🤞":"crossed fingers","🤟":"love-you gesture","🤘":"sign of the horns","🤙":"call me hand"},"hand-single-finger":{"👈":"backhand index pointing left","👉":"backhand index pointing right","👆":"backhand index pointing up","🖕":"middle finger","👇":"backhand index pointing down","☝":"index pointing up"},"hand-fingers-closed":{"👍":"thumbs up","👎":"thumbs down","✊":"raised fist","👊":"oncoming fist","🤛":"left-facing fist","🤜":"right-facing fist"},hands:{"👏":"clapping hands","🙌":"raising hands","👐":"open hands","🤲":"palms up together","🤝":"handshake","🙏":"folded hands"},"hand-prop":{"✍":"writing hand","💅":"nail polish","🤳":"selfie"},"body-parts":{"💪":"flexed biceps","👂":"ear","👃":"nose","🧠":"brain","👀":"eyes","👁":"eye","👅":"tongue","👄":"mouth"},person:{"👶":"baby","🧒":"child","👦":"boy","👧":"girl","🧑":"person","👱":"person: blond hair","👨":"man","🧔":"man: beard","👱‍♂️":"man: blond hair","👩":"woman","👱‍♀️":"woman: blond hair","🧓":"older person","👴":"old man","👵":"old woman"},"person-gesture":{"🙍":"person frowning","🙍‍♂️":"man frowning","🙍‍♀️":"woman frowning","🙎":"person pouting","🙎‍♂️":"man pouting","🙎‍♀️":"woman pouting","🙅":"person gesturing NO","🙅‍♂️":"man gesturing NO","🙅‍♀️":"woman gesturing NO","🙆":"person gesturing OK","🙆‍♂️":"man gesturing OK","🙆‍♀️":"woman gesturing OK","💁":"person tipping hand","💁‍♂️":"man tipping hand","💁‍♀️":"woman tipping hand","🙋":"person raising hand","🙋‍♂️":"man raising hand","🙋‍♀️":"woman raising hand","🙇":"person bowing","🙇‍♂️":"man bowing","🙇‍♀️":"woman bowing","🤦":"person facepalming","🤦‍♂️":"man facepalming","🤦‍♀️":"woman facepalming","🤷":"person shrugging","🤷‍♂️":"man shrugging","🤷‍♀️":"woman shrugging"},"person-role":{"👨‍⚕️":"man health worker","👩‍⚕️":"woman health worker","👨‍🎓":"man student","👩‍🎓":"woman student","👨‍🏫":"man teacher","👩‍🏫":"woman teacher","👨‍⚖️":"man judge","👩‍⚖️":"woman judge","👨‍🌾":"man farmer","👩‍🌾":"woman farmer","👨‍🍳":"man cook","👩‍🍳":"woman cook","👨‍🔧":"man mechanic","👩‍🔧":"woman mechanic","👨‍🏭":"man factory worker","👩‍🏭":"woman factory worker","👨‍💼":"man office worker","👩‍💼":"woman office worker","👨‍🔬":"man scientist","👩‍🔬":"woman scientist","👨‍💻":"man technologist","👩‍💻":"woman technologist","👨‍🎤":"man singer","👩‍🎤":"woman singer","👨‍🎨":"man artist","👩‍🎨":"woman artist","👨‍✈️":"man pilot","👩‍✈️":"woman pilot","👨‍🚀":"man astronaut","👩‍🚀":"woman astronaut","👨‍🚒":"man firefighter","👩‍🚒":"woman firefighter","👮":"police officer","👮‍♂️":"man police officer","👮‍♀️":"woman police officer","🕵":"detective","🕵️‍♂️":"man detective","🕵️‍♀️":"woman detective","💂":"guard","💂‍♂️":"man guard","💂‍♀️":"woman guard","👷":"construction worker","👷‍♂️":"man construction worker","👷‍♀️":"woman construction worker","🤴":"prince","👸":"princess","👳":"person wearing turban","👳‍♂️":"man wearing turban","👳‍♀️":"woman wearing turban","👲":"man with Chinese cap","🧕":"woman with headscarf","🤵":"man in tuxedo","👰":"bride with veil","🤰":"pregnant woman","🤱":"breast-feeding"},"person-fantasy":{"👼":"baby angel","🎅":"Santa Claus","🤶":"Mrs. Claus","🧙":"mage","🧙‍♂️":"man mage","🧙‍♀️":"woman mage","🧚":"fairy","🧚‍♂️":"man fairy","🧚‍♀️":"woman fairy","🧛":"vampire","🧛‍♂️":"man vampire","🧛‍♀️":"woman vampire","🧜":"merperson","🧜‍♂️":"merman","🧜‍♀️":"mermaid","🧝":"elf","🧝‍♂️":"man elf","🧝‍♀️":"woman elf","🧞":"genie","🧞‍♂️":"man genie","🧞‍♀️":"woman genie","🧟":"zombie","🧟‍♂️":"man zombie","🧟‍♀️":"woman zombie"},"person-activity":{"💆":"person getting massage","💆‍♂️":"man getting massage","💆‍♀️":"woman getting massage","💇":"person getting haircut","💇‍♂️":"man getting haircut","💇‍♀️":"woman getting haircut","🚶":"person walking","🚶‍♂️":"man walking","🚶‍♀️":"woman walking","🏃":"person running","🏃‍♂️":"man running","🏃‍♀️":"woman running","💃":"woman dancing","🕺":"man dancing","🕴":"man in suit levitating","👯":"people with bunny ears","👯‍♂️":"men with bunny ears","👯‍♀️":"women with bunny ears","🧖":"person in steamy room","🧖‍♂️":"man in steamy room","🧖‍♀️":"woman in steamy room","🧗":"person climbing","🧗‍♂️":"man climbing","🧗‍♀️":"woman climbing"},"person-sport":{"🤺":"person fencing","🏇":"horse racing","⛷":"skier","🏂":"snowboarder","🏌":"person golfing","🏌️‍♂️":"man golfing","🏌️‍♀️":"woman golfing","🏄":"person surfing","🏄‍♂️":"man surfing","🏄‍♀️":"woman surfing","🚣":"person rowing boat","🚣‍♂️":"man rowing boat","🚣‍♀️":"woman rowing boat","🏊":"person swimming","🏊‍♂️":"man swimming","🏊‍♀️":"woman swimming","⛹":"person bouncing ball","⛹️‍♂️":"man bouncing ball","⛹️‍♀️":"woman bouncing ball","🏋":"person lifting weights","🏋️‍♂️":"man lifting weights","🏋️‍♀️":"woman lifting weights","🚴":"person biking","🚴‍♂️":"man biking","🚴‍♀️":"woman biking","🚵":"person mountain biking","🚵‍♂️":"man mountain biking","🚵‍♀️":"woman mountain biking","🤸":"person cartwheeling","🤸‍♂️":"man cartwheeling","🤸‍♀️":"woman cartwheeling","🤼":"people wrestling","🤼‍♂️":"men wrestling","🤼‍♀️":"women wrestling","🤽":"person playing water polo","🤽‍♂️":"man playing water polo","🤽‍♀️":"woman playing water polo","🤾":"person playing handball","🤾‍♂️":"man playing handball","🤾‍♀️":"woman playing handball","🤹":"person juggling","🤹‍♂️":"man juggling","🤹‍♀️":"woman juggling"},"person-resting":{"🧘":"person in lotus position","🧘‍♂️":"man in lotus position","🧘‍♀️":"woman in lotus position","🛀":"person taking bath","🛌":"person in bed"},family:{"👭":"women holding hands","👫":"woman and man holding hands","👬":"men holding hands","💏":"kiss","👩‍❤️‍💋‍👨":"kiss: woman, man","👨‍❤️‍💋‍👨":"kiss: man, man","👩‍❤️‍💋‍👩":"kiss: woman, woman","💑":"couple with heart","👩‍❤️‍👨":"couple with heart: woman, man","👨‍❤️‍👨":"couple with heart: man, man","👩‍❤️‍👩":"couple with heart: woman, woman","👪":"family","👨‍👩‍👦":"family: man, woman, boy","👨‍👩‍👧":"family: man, woman, girl","👨‍👩‍👧‍👦":"family: man, woman, girl, boy","👨‍👩‍👦‍👦":"family: man, woman, boy, boy","👨‍👩‍👧‍👧":"family: man, woman, girl, girl","👨‍👨‍👦":"family: man, man, boy","👨‍👨‍👧":"family: man, man, girl","👨‍👨‍👧‍👦":"family: man, man, girl, boy","👨‍👨‍👦‍👦":"family: man, man, boy, boy","👨‍👨‍👧‍👧":"family: man, man, girl, girl","👩‍👩‍👦":"family: woman, woman, boy","👩‍👩‍👧":"family: woman, woman, girl","👩‍👩‍👧‍👦":"family: woman, woman, girl, boy","👩‍👩‍👦‍👦":"family: woman, woman, boy, boy","👩‍👩‍👧‍👧":"family: woman, woman, girl, girl","👨‍👦":"family: man, boy","👨‍👦‍👦":"family: man, boy, boy","👨‍👧":"family: man, girl","👨‍👧‍👦":"family: man, girl, boy","👨‍👧‍👧":"family: man, girl, girl","👩‍👦":"family: woman, boy","👩‍👦‍👦":"family: woman, boy, boy","👩‍👧":"family: woman, girl","👩‍👧‍👦":"family: woman, girl, boy","👩‍👧‍👧":"family: woman, girl, girl"},"person-symbol":{"🗣":"speaking head","👤":"bust in silhouette","👥":"busts in silhouette","👣":"footprints"}},"Animals & Nature":{"animal-mammal":{"🐵":"monkey face","🐒":"monkey","🦍":"gorilla","🐶":"dog face","🐕":"dog","🐩":"poodle","🐺":"wolf","🦊":"fox","🐱":"cat face","🐈":"cat","🦁":"lion","🐯":"tiger face","🐅":"tiger","🐆":"leopard","🐴":"horse face","🐎":"horse","🦄":"unicorn","🦓":"zebra","🦌":"deer","🐮":"cow face","🐂":"ox","🐃":"water buffalo","🐄":"cow","🐷":"pig face","🐖":"pig","🐗":"boar","🐽":"pig nose","🐏":"ram","🐑":"ewe","🐐":"goat","🐪":"camel","🐫":"two-hump camel","🦒":"giraffe","🐘":"elephant","🦏":"rhinoceros","🐭":"mouse face","🐁":"mouse","🐀":"rat","🐹":"hamster","🐰":"rabbit face","🐇":"rabbit","🐿":"chipmunk","🦔":"hedgehog","🦇":"bat","🐻":"bear","🐨":"koala","🐼":"panda","🐾":"paw prints"},"animal-bird":{"🦃":"turkey","🐔":"chicken","🐓":"rooster","🐣":"hatching chick","🐤":"baby chick","🐥":"front-facing baby chick","🐦":"bird","🐧":"penguin","🕊":"dove","🦅":"eagle","🦆":"duck","🦉":"owl"},"animal-amphibian":{"🐸":"frog"},"animal-reptile":{"🐊":"crocodile","🐢":"turtle","🦎":"lizard","🐍":"snake","🐲":"dragon face","🐉":"dragon","🦕":"sauropod","🦖":"T-Rex"},"animal-marine":{"🐳":"spouting whale","🐋":"whale","🐬":"dolphin","🐟":"fish","🐠":"tropical fish","🐡":"blowfish","🦈":"shark","🐙":"octopus","🐚":"spiral shell"},"animal-bug":{"🐌":"snail","🦋":"butterfly","🐛":"bug","🐜":"ant","🐝":"honeybee","🐞":"lady beetle","🦗":"cricket","🕷":"spider","🕸":"spider web","🦂":"scorpion"},"plant-flower":{"💐":"bouquet","🌸":"cherry blossom","💮":"white flower","🏵":"rosette","🌹":"rose","🥀":"wilted flower","🌺":"hibiscus","🌻":"sunflower","🌼":"blossom","🌷":"tulip"},"plant-other":{"🌱":"seedling","🌲":"evergreen tree","🌳":"deciduous tree","🌴":"palm tree","🌵":"cactus","🌾":"sheaf of rice","🌿":"herb","☘":"shamrock","🍀":"four leaf clover","🍁":"maple leaf","🍂":"fallen leaf","🍃":"leaf fluttering in wind"}},"Food & Drink":{"food-fruit":{"🍇":"grapes","🍈":"melon","🍉":"watermelon","🍊":"tangerine","🍋":"lemon","🍌":"banana","🍍":"pineapple","🍎":"red apple","🍏":"green apple","🍐":"pear","🍑":"peach","🍒":"cherries","🍓":"strawberry","🥝":"kiwi fruit","🍅":"tomato","🥥":"coconut"},"food-vegetable":{"🥑":"avocado","🍆":"eggplant","🥔":"potato","🥕":"carrot","🌽":"ear of corn","🌶":"hot pepper","🥒":"cucumber","🥦":"broccoli","🍄":"mushroom","🥜":"peanuts","🌰":"chestnut"},"food-prepared":{"🍞":"bread","🥐":"croissant","🥖":"baguette bread","🥨":"pretzel","🥞":"pancakes","🧀":"cheese wedge","🍖":"meat on bone","🍗":"poultry leg","🥩":"cut of meat","🥓":"bacon","🍔":"hamburger","🍟":"french fries","🍕":"pizza","🌭":"hot dog","🥪":"sandwich","🌮":"taco","🌯":"burrito","🥙":"stuffed flatbread","🥚":"egg","🍳":"cooking","🥘":"shallow pan of food","🍲":"pot of food","🥣":"bowl with spoon","🥗":"green salad","🍿":"popcorn","🥫":"canned food"},"food-asian":{"🍱":"bento box","🍘":"rice cracker","🍙":"rice ball","🍚":"cooked rice","🍛":"curry rice","🍜":"steaming bowl","🍝":"spaghetti","🍠":"roasted sweet potato","🍢":"oden","🍣":"sushi","🍤":"fried shrimp","🍥":"fish cake with swirl","🍡":"dango","🥟":"dumpling","🥠":"fortune cookie","🥡":"takeout box"},"food-marine":{"🦀":"crab","🦐":"shrimp","🦑":"squid"},"food-sweet":{"🍦":"soft ice cream","🍧":"shaved ice","🍨":"ice cream","🍩":"doughnut","🍪":"cookie","🎂":"birthday cake","🍰":"shortcake","🧁":"⊛ cupcake","🥧":"pie","🍫":"chocolate bar","🍬":"candy","🍭":"lollipop","🍮":"custard","🍯":"honey pot"},drink:{"🍼":"baby bottle","🥛":"glass of milk","☕":"hot beverage","🍵":"teacup without handle","🍶":"sake","🍾":"bottle with popping cork","🍷":"wine glass","🍸":"cocktail glass","🍹":"tropical drink","🍺":"beer mug","🍻":"clinking beer mugs","🥂":"clinking glasses","🥃":"tumbler glass","🥤":"cup with straw"},dishware:{"🥢":"chopsticks","🍽":"fork and knife with plate","🍴":"fork and knife","🥄":"spoon","🔪":"kitchen knife","🏺":"amphora"}},"Travel & Places":{"place-map":{"🌍":"globe showing Europe-Africa","🌎":"globe showing Americas","🌏":"globe showing Asia-Australia","🌐":"globe with meridians","🗺":"world map","🗾":"map of Japan"},"place-geographic":{"🏔":"snow-capped mountain","⛰":"mountain","🌋":"volcano","🗻":"mount fuji","🏕":"camping","🏖":"beach with umbrella","🏜":"desert","🏝":"desert island","🏞":"national park"},"place-building":{"🏟":"stadium","🏛":"classical building","🏗":"building construction","🏘":"houses","🏚":"derelict house","🏠":"house","🏡":"house with garden","🏢":"office building","🏣":"Japanese post office","🏤":"post office","🏥":"hospital","🏦":"bank","🏨":"hotel","🏩":"love hotel","🏪":"convenience store","🏫":"school","🏬":"department store","🏭":"factory","🏯":"Japanese castle","🏰":"castle","💒":"wedding","🗼":"Tokyo tower","🗽":"Statue of Liberty"},"place-religious":{"⛪":"church","🕌":"mosque","🕍":"synagogue","⛩":"shinto shrine","🕋":"kaaba"},"place-other":{"⛲":"fountain","⛺":"tent","🌁":"foggy","🌃":"night with stars","🏙":"cityscape","🌄":"sunrise over mountains","🌅":"sunrise","🌆":"cityscape at dusk","🌇":"sunset","🌉":"bridge at night","♨":"hot springs","🌌":"milky way","🎠":"carousel horse","🎡":"ferris wheel","🎢":"roller coaster","💈":"barber pole","🎪":"circus tent"},"transport-ground":{"🚂":"locomotive","🚃":"railway car","🚄":"high-speed train","🚅":"bullet train","🚆":"train","🚇":"metro","🚈":"light rail","🚉":"station","🚊":"tram","🚝":"monorail","🚞":"mountain railway","🚋":"tram car","🚌":"bus","🚍":"oncoming bus","🚎":"trolleybus","🚐":"minibus","🚑":"ambulance","🚒":"fire engine","🚓":"police car","🚔":"oncoming police car","🚕":"taxi","🚖":"oncoming taxi","🚗":"automobile","🚘":"oncoming automobile","🚙":"sport utility vehicle","🚚":"delivery truck","🚛":"articulated lorry","🚜":"tractor","🏎":"racing car","🏍":"motorcycle","🛵":"motor scooter","🚲":"bicycle","🛴":"kick scooter","🚏":"bus stop","🛣":"motorway","🛤":"railway track","🛢":"oil drum","⛽":"fuel pump","🚨":"police car light","🚥":"horizontal traffic light","🚦":"vertical traffic light","🛑":"stop sign","🚧":"construction"},"transport-water":{"⚓":"anchor","⛵":"sailboat","🛶":"canoe","🚤":"speedboat","🛳":"passenger ship","⛴":"ferry","🛥":"motor boat","🚢":"ship"},"transport-air":{"✈":"airplane","🛩":"small airplane","🛫":"airplane departure","🛬":"airplane arrival","💺":"seat","🚁":"helicopter","🚟":"suspension railway","🚠":"mountain cableway","🚡":"aerial tramway","🛰":"satellite","🚀":"rocket","🛸":"flying saucer"},hotel:{"🛎":"bellhop bell","🧳":"⊛ luggage"},time:{"⌛":"hourglass done","⏳":"hourglass not done","⌚":"watch","⏰":"alarm clock","⏱":"stopwatch","⏲":"timer clock","🕰":"mantelpiece clock","🕛":"twelve o’clock","🕧":"twelve-thirty","🕐":"one o’clock","🕜":"one-thirty","🕑":"two o’clock","🕝":"two-thirty","🕒":"three o’clock","🕞":"three-thirty","🕓":"four o’clock","🕟":"four-thirty","🕔":"five o’clock","🕠":"five-thirty","🕕":"six o’clock","🕡":"six-thirty","🕖":"seven o’clock","🕢":"seven-thirty","🕗":"eight o’clock","🕣":"eight-thirty","🕘":"nine o’clock","🕤":"nine-thirty","🕙":"ten o’clock","🕥":"ten-thirty","🕚":"eleven o’clock","🕦":"eleven-thirty"},"sky & weather":{"🌑":"new moon","🌒":"waxing crescent moon","🌓":"first quarter moon","🌔":"waxing gibbous moon","🌕":"full moon","🌖":"waning gibbous moon","🌗":"last quarter moon","🌘":"waning crescent moon","🌙":"crescent moon","🌚":"new moon face","🌛":"first quarter moon face","🌜":"last quarter moon face","🌡":"thermometer","☀":"sun","🌝":"full moon face","🌞":"sun with face","⭐":"star","🌟":"glowing star","🌠":"shooting star","☁":"cloud","⛅":"sun behind cloud","⛈":"cloud with lightning and rain","🌤":"sun behind small cloud","🌥":"sun behind large cloud","🌦":"sun behind rain cloud","🌧":"cloud with rain","🌨":"cloud with snow","🌩":"cloud with lightning","🌪":"tornado","🌫":"fog","🌬":"wind face","🌀":"cyclone","🌈":"rainbow","🌂":"closed umbrella","☂":"umbrella","☔":"umbrella with rain drops","⛱":"umbrella on ground","⚡":"high voltage","❄":"snowflake","☃":"snowman","⛄":"snowman without snow","☄":"comet","🔥":"fire","💧":"droplet","🌊":"water wave"}},Activities:{event:{"🎃":"jack-o-lantern","🎄":"Christmas tree","🎆":"fireworks","🎇":"sparkler","✨":"sparkles","🎈":"balloon","🎉":"party popper","🎊":"confetti ball","🎋":"tanabata tree","🎍":"pine decoration","🎎":"Japanese dolls","🎏":"carp streamer","🎐":"wind chime","🎑":"moon viewing ceremony","🎀":"ribbon","🎁":"wrapped gift","🎗":"reminder ribbon","🎟":"admission tickets","🎫":"ticket"},"award-medal":{"🎖":"military medal","🏆":"trophy","🏅":"sports medal","🥇":"1st place medal","🥈":"2nd place medal","🥉":"3rd place medal"},sport:{"⚽":"soccer ball","⚾":"baseball","🏀":"basketball","🏐":"volleyball","🏈":"american football","🏉":"rugby football","🎾":"tennis","🎳":"bowling","🏏":"cricket game","🏑":"field hockey","🏒":"ice hockey","🏓":"ping pong","🏸":"badminton","🥊":"boxing glove","🥋":"martial arts uniform","🥅":"goal net","⛳":"flag in hole","⛸":"ice skate","🎣":"fishing pole","🎽":"running shirt","🎿":"skis","🛷":"sled","🥌":"curling stone"},game:{"🎯":"direct hit","🎱":"pool 8 ball","🔮":"crystal ball","🎮":"video game","🕹":"joystick","🎰":"slot machine","🎲":"game die","♠":"spade suit","♥":"heart suit","♦":"diamond suit","♣":"club suit","♟":"⊛ chess pawn","🃏":"joker","🀄":"mahjong red dragon","🎴":"flower playing cards"},"arts & crafts":{"🎭":"performing arts","🖼":"framed picture","🎨":"artist palette"}},Objects:{clothing:{"👓":"glasses","🕶":"sunglasses","👔":"necktie","👕":"t-shirt","👖":"jeans","🧣":"scarf","🧤":"gloves","🧥":"coat","🧦":"socks","👗":"dress","👘":"kimono","👙":"bikini","👚":"woman’s clothes","👛":"purse","👜":"handbag","👝":"clutch bag","🛍":"shopping bags","🎒":"backpack","👞":"man’s shoe","👟":"running shoe","👠":"high-heeled shoe","👡":"woman’s sandal","👢":"woman’s boot","👑":"crown","👒":"woman’s hat","🎩":"top hat","🎓":"graduation cap","🧢":"billed cap","⛑":"rescue worker’s helmet","📿":"prayer beads","💄":"lipstick","💍":"ring","💎":"gem stone"},sound:{"🔇":"muted speaker","🔈":"speaker low volume","🔉":"speaker medium volume","🔊":"speaker high volume","📢":"loudspeaker","📣":"megaphone","📯":"postal horn","🔔":"bell","🔕":"bell with slash"},music:{"🎼":"musical score","🎵":"musical note","🎶":"musical notes","🎙":"studio microphone","🎚":"level slider","🎛":"control knobs","🎤":"microphone","🎧":"headphone","📻":"radio"},"musical-instrument":{"🎷":"saxophone","🎸":"guitar","🎹":"musical keyboard","🎺":"trumpet","🎻":"violin","🥁":"drum"},phone:{"📱":"mobile phone","📲":"mobile phone with arrow","☎":"telephone","📞":"telephone receiver","📟":"pager","📠":"fax machine"},computer:{"🔋":"battery","🔌":"electric plug","💻":"laptop computer","🖥":"desktop computer","🖨":"printer","⌨":"keyboard","🖱":"computer mouse","🖲":"trackball","💽":"computer disk","💾":"floppy disk","💿":"optical disk","📀":"dvd"},"light & video":{"🎥":"movie camera","🎞":"film frames","📽":"film projector","🎬":"clapper board","📺":"television","📷":"camera","📸":"camera with flash","📹":"video camera","📼":"videocassette","🔍":"magnifying glass tilted left","🔎":"magnifying glass tilted right","🕯":"candle","💡":"light bulb","🔦":"flashlight","🏮":"red paper lantern"},"book-paper":{"📔":"notebook with decorative cover","📕":"closed book","📖":"open book","📗":"green book","📘":"blue book","📙":"orange book","📚":"books","📓":"notebook","📒":"ledger","📃":"page with curl","📜":"scroll","📄":"page facing up","📰":"newspaper","🗞":"rolled-up newspaper","📑":"bookmark tabs","🔖":"bookmark","🏷":"label"},money:{"💰":"money bag","💴":"yen banknote","💵":"dollar banknote","💶":"euro banknote","💷":"pound banknote","💸":"money with wings","💳":"credit card","💹":"chart increasing with yen","💱":"currency exchange","💲":"heavy dollar sign"},mail:{"✉":"envelope","📧":"e-mail","📨":"incoming envelope","📩":"envelope with arrow","📤":"outbox tray","📥":"inbox tray","📦":"package","📫":"closed mailbox with raised flag","📪":"closed mailbox with lowered flag","📬":"open mailbox with raised flag","📭":"open mailbox with lowered flag","📮":"postbox","🗳":"ballot box with ballot"},writing:{"✏":"pencil","✒":"black nib","🖋":"fountain pen","🖊":"pen","🖌":"paintbrush","🖍":"crayon","📝":"memo"},office:{"💼":"briefcase","📁":"file folder","📂":"open file folder","🗂":"card index dividers","📅":"calendar","📆":"tear-off calendar","🗒":"spiral notepad","🗓":"spiral calendar","📇":"card index","📈":"chart increasing","📉":"chart decreasing","📊":"bar chart","📋":"clipboard","📌":"pushpin","📍":"round pushpin","📎":"paperclip","🖇":"linked paperclips","📏":"straight ruler","📐":"triangular ruler","✂":"scissors","🗃":"card file box","🗄":"file cabinet","🗑":"wastebasket"},lock:{"🔒":"locked","🔓":"unlocked","🔏":"locked with pen","🔐":"locked with key","🔑":"key","🗝":"old key"},tool:{"🔨":"hammer","⛏":"pick","⚒":"hammer and pick","🛠":"hammer and wrench","🗡":"dagger","⚔":"crossed swords","🔫":"pistol","🏹":"bow and arrow","🛡":"shield","🔧":"wrench","🔩":"nut and bolt","⚙":"gear","🗜":"clamp","⚖":"balance scale","🔗":"link","⛓":"chains"},science:{"⚗":"alembic","🔬":"microscope","🔭":"telescope","📡":"satellite antenna"},medical:{"💉":"syringe","💊":"pill"},household:{"🚪":"door","🛏":"bed","🛋":"couch and lamp","🚽":"toilet","🚿":"shower","🛁":"bathtub","🛒":"shopping cart"},"other-object":{"🚬":"cigarette","⚰":"coffin","⚱":"funeral urn","🗿":"moai"}},Symbols:{"transport-sign":{"🏧":"ATM sign","🚮":"litter in bin sign","🚰":"potable water","♿":"wheelchair symbol","🚹":"men’s room","🚺":"women’s room","🚻":"restroom","🚼":"baby symbol","🚾":"water closet","🛂":"passport control","🛃":"customs","🛄":"baggage claim","🛅":"left luggage"},warning:{"⚠":"warning","🚸":"children crossing","⛔":"no entry","🚫":"prohibited","🚳":"no bicycles","🚭":"no smoking","🚯":"no littering","🚱":"non-potable water","🚷":"no pedestrians","📵":"no mobile phones","🔞":"no one under eighteen","☢":"radioactive","☣":"biohazard"},arrow:{"⬆":"up arrow","↗":"up-right arrow","➡":"right arrow","↘":"down-right arrow","⬇":"down arrow","↙":"down-left arrow","⬅":"left arrow","↖":"up-left arrow","↕":"up-down arrow","↔":"left-right arrow","↩":"right arrow curving left","↪":"left arrow curving right","⤴":"right arrow curving up","⤵":"right arrow curving down","🔃":"clockwise vertical arrows","🔄":"counterclockwise arrows button","🔙":"BACK arrow","🔚":"END arrow","🔛":"ON! arrow","🔜":"SOON arrow","🔝":"TOP arrow"},religion:{"🛐":"place of worship","⚛":"atom symbol","🕉":"om","✡":"star of David","☸":"wheel of dharma","☯":"yin yang","✝":"latin cross","☦":"orthodox cross","☪":"star and crescent","☮":"peace symbol","🕎":"menorah","🔯":"dotted six-pointed star"},zodiac:{"♈":"Aries","♉":"Taurus","♊":"Gemini","♋":"Cancer","♌":"Leo","♍":"Virgo","♎":"Libra","♏":"Scorpio","♐":"Sagittarius","♑":"Capricorn","♒":"Aquarius","♓":"Pisces","⛎":"Ophiuchus"},"av-symbol":{"🔀":"shuffle tracks button","🔁":"repeat button","🔂":"repeat single button","▶":"play button","⏩":"fast-forward button","⏭":"next track button","⏯":"play or pause button","◀":"reverse button","⏪":"fast reverse button","⏮":"last track button","🔼":"upwards button","⏫":"fast up button","🔽":"downwards button","⏬":"fast down button","⏸":"pause button","⏹":"stop button","⏺":"record button","⏏":"eject button","🎦":"cinema","🔅":"dim button","🔆":"bright button","📶":"antenna bars","📳":"vibration mode","📴":"mobile phone off"},gender:{"♀":"female sign","♂":"male sign"},"other-symbol":{"⚕":"medical symbol","♾":"⊛ infinity","♻":"recycling symbol","⚜":"fleur-de-lis","🔱":"trident emblem","📛":"name badge","🔰":"Japanese symbol for beginner","⭕":"hollow red circle","✅":"check mark button","☑":"check box with check","✔":"check mark","✖":"multiplication sign","❌":"cross mark","❎":"cross mark button","➕":"plus sign","➖":"minus sign","➗":"division sign","➰":"curly loop","➿":"double curly loop","〽":"part alternation mark","✳":"eight-spoked asterisk","✴":"eight-pointed star","❇":"sparkle","‼":"double exclamation mark","⁉":"exclamation question mark","❓":"question mark","❔":"white question mark","❕":"white exclamation mark","❗":"exclamation mark","〰":"wavy dash","©":"copyright","®":"registered","™":"trade mark"},keycap:{"#️⃣":"keycap: #","*️⃣":"keycap: *","0️⃣":"keycap: 0","1️⃣":"keycap: 1","2️⃣":"keycap: 2","3️⃣":"keycap: 3","4️⃣":"keycap: 4","5️⃣":"keycap: 5","6️⃣":"keycap: 6","7️⃣":"keycap: 7","8️⃣":"keycap: 8","9️⃣":"keycap: 9","🔟":"keycap: 10"},alphanum:{"🔠":"input latin uppercase","🔡":"input latin lowercase","🔢":"input numbers","🔣":"input symbols","🔤":"input latin letters","🅰":"A button (blood type)","🆎":"AB button (blood type)","🅱":"B button (blood type)","🆑":"CL button","🆒":"COOL button","🆓":"FREE button","ℹ":"information","🆔":"ID button","Ⓜ":"circled M","🆕":"NEW button","🆖":"NG button","🅾":"O button (blood type)","🆗":"OK button","🅿":"P button","🆘":"SOS button","🆙":"UP! button","🆚":"VS button","🈁":"Japanese “here” button","🈂":"Japanese “service charge” button","🈷":"Japanese “monthly amount” button","🈶":"Japanese “not free of charge” button","🈯":"Japanese “reserved” button","🉐":"Japanese “bargain” button","🈹":"Japanese “discount” button","🈚":"Japanese “free of charge” button","🈲":"Japanese “prohibited” button","🉑":"Japanese “acceptable” button","🈸":"Japanese “application” button","🈴":"Japanese “passing grade” button","🈳":"Japanese “vacancy” button","㊗":"Japanese “congratulations” button","㊙":"Japanese “secret” button","🈺":"Japanese “open for business” button","🈵":"Japanese “no vacancy” button"},geometric:{"🔴":"red circle","🔵":"blue circle","⚪":"white circle","⚫":"black circle","⬜":"white large square","⬛":"black large square","◼":"black medium square","◻":"white medium square","◽":"white medium-small square","◾":"black medium-small square","▫":"white small square","▪":"black small square","🔶":"large orange diamond","🔷":"large blue diamond","🔸":"small orange diamond","🔹":"small blue diamond","🔺":"red triangle pointed up","🔻":"red triangle pointed down","💠":"diamond with a dot","🔘":"radio button","🔲":"black square button","🔳":"white square button"}},Flags:{flag:{"🏁":"chequered flag","🚩":"triangular flag","🎌":"crossed flags","🏴":"black flag","🏳":"white flag","🏳️‍🌈":"rainbow flag","🏴‍☠️":"⊛ pirate flag"},"subdivision-flag":{"🏴󠁧󠁢󠁥󠁮󠁧󠁿":"flag: England","🏴󠁧󠁢󠁳󠁣󠁴󠁿":"flag: Scotland","🏴󠁧󠁢󠁷󠁬󠁳󠁿":"flag: Wales"}}};