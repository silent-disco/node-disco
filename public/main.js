$(function() {

  /**
   * Extract the room from the users
   *
   * @return {String} extracted room name
   */
  function roomFromUrl() {

    var href = window.location.href;

    var roomMatch = /\/(r\/([A-z0-9_-]+))?$/.exec(href);

    if (!roomMatch) {
      window.history.replaceState(null, null, '/');
    }

    return (roomMatch && roomMatch[2]) || 'lobby';
  }

  /**
   * Creates a new socket.io instance.
   *
   * @return {IoSocket}
   */
  function createSocket() {
    var split = window.location.host.split(':');

    // fix websocket connection port on open shift
    if (split[0].indexOf('rhcloud.com') !== -1) {
      split[1] = 8443;
    }

    return io(split.join(':'));
  }

  var roomId = roomFromUrl();
  var socket = createSocket();


  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize varibles
  var $window = $(window);
  var $userNameInput = $('.userNameInput'); // Input for userName
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  var user;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $userNameInput.focus();

  // update room name in login page
  $loginPage.find('.roomName').text(roomId);
  $loginPage.fadeIn();

  $userNameInput.focus();

  window.addEventListener('popstate', function(e) {
    var newRoomId = roomFromUrl();

    if (user && newRoomId !== roomId) {
      roomId = newRoomId;

      join(user);
    }
  });

  function addParticipantsMessage(data) {
    var message = '';
    if (data.activeUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.activeUsers + " participants";
    }
    log(message);
  }


  function join(existingUser) {
    var userName = cleanInput($userNameInput.val().trim());

    // check if login via user name selection
    // is requested
    if (userName) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();
    }

    // if not, keep already used user name
    if (existingUser) {
      userName = existingUser.name;
    }

    if (userName) {
      user = { name: userName };

      // Tell the server your userName
      socket.emit('join', roomId, userName);
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        user: user,
        message: message
      });

      socket.emit('message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $userNameDiv = $('<span class="userName"/>')
      .text(data.user.name)
      .css('color', getUserColor(data.user));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('userName', data.user.name)
      .addClass(typingClass)
      .append($userNameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stopped-typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('userName') === data.user.name;
    });
  }

  // Gets the color of a userName through our hash function
  function getUserColor(user) {

    var id = user.id;

    // Compute hash code
    var hash = 7;
    for (var i = 0; i < id.length; i++) {
       hash = id.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (user) {
        sendMessage();
        socket.emit('stopped-typing');
        typing = false;
      } else {
        join();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('joined', function(data) {
    user = data.user;

    connected = true;
    // Display the welcome message
    var message = "Welcome to silent disco / " + data.roomId + " – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user-joined', function(data) {
    log(data.user.name + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user-left', function (data) {
    log(data.user.name + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('user-typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('user-stopped-typing', function (data) {
    removeChatTyping(data);
  });
});
