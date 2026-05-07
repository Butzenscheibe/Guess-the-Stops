export function initCustomSelects() {
  const selects = document.querySelectorAll('select');

  selects.forEach((select) => {
    if (select.parentElement && select.parentElement.classList.contains('custom-select')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    const styled = document.createElement('div');
    styled.className = 'select-styled';
    styled.textContent = select.options[select.selectedIndex]?.text || '';
    wrapper.appendChild(styled);

    const optionsList = document.createElement('ul');
    optionsList.className = 'select-options';

    Array.from(select.options).forEach((option, index) => {
      const li = document.createElement('li');
      li.textContent = option.text;
      li.setAttribute('data-value', option.value);
      if (index === select.selectedIndex) {
        li.classList.add('selected');
      }
      optionsList.appendChild(li);
    });

    wrapper.appendChild(optionsList);

    styled.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.select-styled.active').forEach((other) => {
        if (other !== styled) {
          other.classList.remove('active');
          other.nextElementSibling?.classList.remove('active');
        }
      });
      styled.classList.toggle('active');
      optionsList.classList.toggle('active');
    });

    optionsList.querySelectorAll('li').forEach((li) => {
      li.addEventListener('click', function (e) {
        e.stopPropagation();
        const value = this.getAttribute('data-value');
        const text = this.textContent;

        select.value = value;
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);

        styled.textContent = text;
        optionsList.querySelectorAll('li').forEach((item) => item.classList.remove('selected'));
        this.classList.add('selected');

        styled.classList.remove('active');
        optionsList.classList.remove('active');
      });
    });
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.select-styled.active').forEach((styled) => {
      styled.classList.remove('active');
      styled.nextElementSibling?.classList.remove('active');
    });
  });
}

export function updateCustomSelect(selectElement) {
  if (!selectElement) return;
  const wrapper = selectElement.parentElement;
  if (!wrapper || !wrapper.classList.contains('custom-select')) {
    initCustomSelects();
    return;
  }

  const styled = wrapper.querySelector('.select-styled');
  const optionsList = wrapper.querySelector('.select-options');

  if (!styled || !optionsList) return;

  styled.textContent = selectElement.options[selectElement.selectedIndex]?.text || '';
  optionsList.innerHTML = '';

  Array.from(selectElement.options).forEach((option, index) => {
    const li = document.createElement('li');
    li.textContent = option.text;
    li.setAttribute('data-value', option.value);
    if (index === selectElement.selectedIndex) {
      li.classList.add('selected');
    }
    li.addEventListener('click', function (e) {
      e.stopPropagation();
      const value = this.getAttribute('data-value');
      const text = this.textContent;

      selectElement.value = value;
      const event = new Event('change', { bubbles: true });
      selectElement.dispatchEvent(event);

      styled.textContent = text;
      optionsList.querySelectorAll('li').forEach((item) => item.classList.remove('selected'));
      this.classList.add('selected');

      styled.classList.remove('active');
      optionsList.classList.remove('active');
    });
    optionsList.appendChild(li);
  });

  styled.classList.remove('active');
  optionsList.classList.remove('active');
}
