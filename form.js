document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('reservationForm');
    var submitButton = form.querySelector('button[type="submit"]');
    var lastName = document.getElementById('lastName');
    var firstName = document.getElementById('firstName');
    var numberOfGuests = document.getElementById('numberOfGuests');
    var scriptUrl = 'https://script.google.com/macros/s/AKfycbxrRcB9FahbhyuyHSu3ZVdB8aSzAKwx2zRomd4x23yMNTdaqNhIy1ZQJCPH_dkWJqGkPg/exec';
  
    // 予約可能席数を超えた時刻のラジオボタンを無効にし、ラベルにスタイルを適用する関数
    function updateRadioButtons(availableSeats, reservedCounts, countSeats) {
      availableSeats.forEach(function(time, index) {
        var radioInput = document.getElementById('time' + index);
        var label = document.querySelector('label[for="time' + index + '"]');
        var totalReserved = reservedCounts[index] + parseInt(numberOfGuests.value, 10) || 0;
  
        if (totalReserved > countSeats) {
          radioInput.disabled = true;
          label.classList.add('disabled'); // スタイルクラスを追加
        } else {
          radioInput.disabled = false;
          label.classList.remove('disabled'); // スタイルクラスを削除
        }
      });
    }
  
    
    fetch(scriptUrl)
      .then(function(response) {
        return response.json();
      })
      .then(function(jsonData) {
        var mainName = jsonData.MainName;
        var subName = jsonData.SubName;
        var countSeats = jsonData.CountSeats;
        var availableTime = jsonData.AvailableTime;
        var reservedCount = jsonData.ReservedCount.map(Number); // 文字列を数値に変換
        var arrivalTimeOptions = document.getElementById('arrivalTimeOptions');

        document.getElementById('mainName').textContent = mainName;
        document.getElementById('subName').textContent = '～ ' + subName + ' ～';

        availableTime.forEach(function(time, index) {
          var radioContainer = document.createElement('div');
          radioContainer.classList.add('radio-container');
  
          var radioInput = document.createElement('input');
          radioInput.type = 'radio';
          radioInput.id = 'time' + index;
          radioInput.name = 'arrivalTime';
          radioInput.value = time;
          radioInput.required = true;
  
          var label = document.createElement('label');
          label.htmlFor = 'time' + index;
          label.textContent = time + ':00';
  
          radioContainer.appendChild(radioInput);
          radioContainer.appendChild(label);
          arrivalTimeOptions.appendChild(radioContainer);
        });
  
        // ラジオボタンの初期状態を設定
        updateRadioButtons(availableTime, reservedCount, countSeats);
  
        // 来店人数入力フィールドの変更を監視して、ラジオボタンの有効/無効を切り替える
        numberOfGuests.addEventListener('input', function() {
          updateRadioButtons(availableTime, reservedCount, countSeats);
          updateSubmitButtonState(); // ボタンの状態を更新
        });
      })
      .catch(function(error) {
        console.error('Error:', error);
      });
  
    function updateSubmitButtonState() {
      var isArrivalTimeSelected = Array.from(document.getElementsByName('arrivalTime')).some(radio => radio.checked);
      submitButton.disabled = !(lastName.value.trim() && firstName.value.trim() && numberOfGuests.value && isArrivalTimeSelected);
    }
  
    form.addEventListener('input', updateSubmitButtonState);

    // フォーム送信処理
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // デフォルトの送信を防止

        var selectedRadio = document.querySelector('input[name="arrivalTime"]:checked');
        var arrivalTime = selectedRadio ? selectedRadio.value : '';

        var formData = {
            'lastName': lastName.value,
            'firstName': firstName.value,
            'numberOfGuests': numberOfGuests.value,
            'arrivalTime': arrivalTime,
            'notes': form.notes.value
        };

        // データを送信
        fetch(scriptUrl, {
            method: 'POST',
            body: new URLSearchParams(formData),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.json())
        .then(data => {
            alert('予約が完了しました。');
            form.reset();
            // updateRadioButtons(availableTime, reservedCount, countSeats);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('予約の送信に失敗しました。');
        });
    });
  });
  
