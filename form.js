document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reservationForm');
  const submitButton = form.querySelector('button[type="submit"]');
  const lastName = document.getElementById('lastName');
  const firstName = document.getElementById('firstName');
  const numberOfGuests = document.getElementById('numberOfGuests');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbwzVFKh-HuaRXKIRjealItVfc1d3OdxrTi_HlvZPMt49tjh8JuyyP_r4b4lON0od8rYAQ/exec';

  const updateRadioButtons = (availableSeats, reservedCounts, countSeats) => {
      availableSeats.forEach((time, index) => {
          const radioInput = document.getElementById(`time${index}`);
          const label = document.querySelector(`label[for="time${index}"]`);
          const totalReserved = reservedCounts[index] + parseInt(numberOfGuests.value, 10) || 0;

          if (totalReserved > countSeats) {
              radioInput.disabled = true;
              label.classList.add('disabled');
          } else {
              radioInput.disabled = false;
              label.classList.remove('disabled');
          }
      });
  };

  const updateSubmitButtonState = () => {
      const isArrivalTimeSelected = Array.from(document.getElementsByName('arrivalTime')).some(radio => radio.checked);
      submitButton.disabled = !(lastName.value.trim() && firstName.value.trim() && numberOfGuests.value && isArrivalTimeSelected);
  };

  // ローディングインジケータの表示
  loadingIndicator.classList.add('show'); // ロード開始時に表示

  fetch(scriptUrl)
      .then(response => {
        loadingIndicator.classList.remove('show');
        return response.json();
      })
      .then(jsonData => {
          const { MainName, SubName, CountSeats, AvailableTime, ReservedCount } = jsonData;
          const arrivalTimeOptions = document.getElementById('arrivalTimeOptions');

          document.getElementById('mainName').textContent = MainName;
          document.getElementById('subName').textContent = `～ ${SubName} ～`;

          AvailableTime.forEach((time, index) => {
              const radioContainer = document.createElement('div');
              radioContainer.classList.add('radio-container');

              const radioInput = document.createElement('input');
              radioInput.type = 'radio';
              radioInput.id = `time${index}`;
              radioInput.name = 'arrivalTime';
              radioInput.value = time;
              radioInput.required = true;

              const label = document.createElement('label');
              label.htmlFor = `time${index}`;
              label.textContent = `${time}:00`;

              radioContainer.appendChild(radioInput);
              radioContainer.appendChild(label);
              arrivalTimeOptions.appendChild(radioContainer);
          });

          updateRadioButtons(AvailableTime, ReservedCount.map(Number), CountSeats);

          numberOfGuests.addEventListener('input', () => {
              updateRadioButtons(AvailableTime, ReservedCount.map(Number), CountSeats);
              updateSubmitButtonState();
          });
      })
      .catch(error => {
        console.error('Error:', error);
        loadingIndicator.classList.remove('show');
      });

  form.addEventListener('input', updateSubmitButtonState);

  form.addEventListener('submit', event => {
      event.preventDefault();
      const selectedRadio = document.querySelector('input[name="arrivalTime"]:checked');
      const arrivalTime = selectedRadio ? selectedRadio.value : '';

      const formData = {
          'lastName': lastName.value,
          'firstName': firstName.value,
          'numberOfGuests': numberOfGuests.value,
          'arrivalTime': arrivalTime,
          'notes': form.notes.value
      };

      fetch(scriptUrl, {
          method: 'POST',
          body: new URLSearchParams(formData),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(response => response.json())
      .then(() => {
          alert('予約が完了しました。');
          form.reset();
      })
      .catch(error => {
          console.error('Error:', error);
          alert('予約の送信に失敗しました。');
      });
  });
});
