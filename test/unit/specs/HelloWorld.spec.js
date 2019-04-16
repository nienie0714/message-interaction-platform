import Vue from 'vue'
import DynamicFlightView from '@/components/DynamicFlightView'

describe('DynamicFlightView.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(DynamicFlightView)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.hello h1').textContent)
      .to.equal('Welcome to Your Vue.js App')
  })
})
