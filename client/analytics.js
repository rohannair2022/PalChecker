document.addEventListener('DOMContentLoaded', function() {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
    const currentYear = currentDate.getFullYear();
  
    const monthHeader = document.querySelector('.month-header');
    monthHeader.textContent = `${currentMonth} ${currentYear}`;
  
    const daysContainer = document.querySelector('.days');
    daysContainer.innerHTML = '';
  
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyDay = document.createElement('div');
      daysContainer.appendChild(emptyDay);
    }
  
    for (let i = 1; i <= daysInMonth; i++) {
      const day = document.createElement('div');
      day.textContent = i;

      // Sample test for check-in
      if (i === currentDate.getDay()) {
        day.classList.add('green');
      }
      
      daysContainer.appendChild(day);
    }
  });
  
