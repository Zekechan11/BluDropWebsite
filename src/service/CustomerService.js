export const CustomerService = {
    getData() {
        return [
            {
                id: 1000,
                representative: {
                    name: 'Ioni Bowcher',
                    image: 'ionibowcher.png'
                },
                area: 'Guadalupe',
                date: '2015-09-13',
                status: 'This Week',
                collected: '200.00',
            },
           
            {
                id: 1002,
                representative: {
                    name: 'Asiya Javayant',
                    image: 'asiyajavayant.png'
                },
                area: 'Nailon',
                date: '2017-05-13',
                status: 'This Month',
                collected: '10000.00',
            },
            {
                id: 1003,
                representative: {
                    name: 'Xuxue Feng',
                    image: 'xuxuefeng.png'
                },
                area: 'Odlot',
                date: '2020-09-15',
                status: 'This Year',
                collected: '1500.00',
            }
        ];
    },


    getCustomersMedium() {
        return Promise.resolve(this.getData().slice(0, 50));
    },

    getCustomersLarge() {
        return Promise.resolve(this.getData().slice(0, 200));
    },
    
    getCustomers(params) {
        const queryParams = params
            ? Object.keys(params)
                  .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
                  .join('&')
            : '';

        return fetch('https://www.primefaces.org/data/customers?' + queryParams).then((res) => res.json());
    }
};