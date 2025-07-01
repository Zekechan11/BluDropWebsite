<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import ScrollTop from "primevue/scrolltop";

const products = ref([
  {
    id: 1,
    name: "John Doe",
    title: "Satisfied Customer",
    testimonial: "This service has transformed my life! Highly recommend.",
    image: "/demo/images/user.jpg", // Update the image path as needed
  },
  {
    id: 2,
    name: "Jane Smith",
    title: "Happy Client",
    testimonial: "Amazing experience! Will use again.",
    image: "/demo/images/user2.jpg", // Update the image path as needed
  },
  {
    id: 3,
    name: "Alice Johnson",
    title: "Regular Customer",
    testimonial: "Top-notch service and support.",
    image: "/demo/images/user.jpg", // Update the image path as needed
  },
  {
    id: 4,
    name: "Bob Brown",
    title: "Loyal Customer",
    testimonial: "Excellent quality and service.",
    image: "/demo/images/user.jpg", // Update the image path as needed
  },
  {
    id: 5,
    name: "Mary White",
    title: "Frequent User",
    testimonial: "A game changer for my business.",
    image: "/demo/images/user.jpg", // Update the image path as needed
  },
  {
    id: 6,
    name: "Chris Green",
    title: "Long-time User",
    testimonial: "Incredible value and support!",
    image: "/demo/images/user.jpg", // Update the image path as needed
  },
  // Add more testimonials as needed
]);
const responsiveOptions = ref([
  {
    breakpoint: "1400px",
    numVisible: 2,
    numScroll: 1,
  },
  {
    breakpoint: "1199px",
    numVisible: 3,
    numScroll: 1,
  },
  {
    breakpoint: "767px",
    numVisible: 2,
    numScroll: 1,
  },
  {
    breakpoint: "575px",
    numVisible: 1,
    numScroll: 1,
  },
]);

const currentIndex = ref(0);

const visibleProducts = computed(() => {
  return products.value.slice(currentIndex.value, currentIndex.value + 3);
});
const next = () => {
  currentIndex.value = (currentIndex.value + 3) % products.value.length;
};

const prev = () => {
  currentIndex.value =
    (currentIndex.value - 3 + products.value.length) % products.value.length;
};

// Automatic sliding
let intervalId;

const startAutoSlide = () => {
  intervalId = setInterval(() => {
    next();
  }, 3000); // Change slide every 5 seconds
};

const stopAutoSlide = () => {
  clearInterval(intervalId);
};

onMounted(() => {
  startAutoSlide(); // Start the automatic slide when component is mounted
});

onBeforeUnmount(() => {
  stopAutoSlide(); // Stop the automatic slide when component is unmounted
});

function smoothScroll(id) {
  document.body.click();
  document.querySelector(id).scrollIntoView({
    behavior: "smooth",
  });
}
</script>

<template>
  <div class="bg-surface-0 dark:bg-surface-900" style="background-color: #f0f8ff">
    <div id="home" class="landing-wrapper overflow-hidden">
      <div
        class="navbar py-6 px-6 mx-0 md:mx-12 lg:mx-0 lg:px-10 flex items-center justify-between fixed top-0 w-full z-20 shadow-lg"
        style="
          color: darkblue;
          background-color: #f0f8ff;
          font-weight: bold;
          color: white;
        ">
        <a class="flex items-center" href="#">
          <img src="/demo/images/logo.png" alt="" style="width: 35px; height: 35px; margin-right: 20px" />
          <span class="mr-20 w-40"><img src="/demo/images/logo2.png" alt="" /></span>
        </a>
        <Button class="lg:!hidden" text severity="secondary" rounded v-styleclass="{
          selector: '@next',
          enterFromClass: 'hidden',
          enterActiveClass: 'animate-scalein',
          leaveToClass: 'hidden',
          leaveActiveClass: 'animate-fadeout',
          hideOnOutsideClick: true,
        }">
          <i class="pi pi-bars !text-2xl"></i>
        </Button>
        <div
          class="items-center bg-surface-0 dark:bg-surface-900 grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-12 lg:px-0 z-20"
          style="background-color: #f0f8ff">
          <ul class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-8">
            <li>
              <a @click="smoothScroll('#hero')" class="menu-item font-semibold">
                <button text>Home</button>
              </a>
            </li>
            <li>
              <a @click="smoothScroll('#aboutus')" class="menu-item font-semibold">
                <button text>About us</button>
              </a>
            </li>

            <li>
              <a @click="smoothScroll('#testi')" class="menu-item font-semibold">
                <button text>Testimonials</button>
              </a>
            </li>
            <li>
              <a @click="smoothScroll('#delivery-schedules')" class="menu-item font-semibold">
                <button text>Schedules</button>
              </a>
            </li>
            <li>
              <a @click="smoothScroll('#contact')" class="menu-item font-semibold">
                <button text>Contacts</button>
              </a>
            </li>
          </ul>
          <div class="flex items-center gap-2 border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0">
            <!-- Login Button -->
            <Button label="Login" as="router-link" to="/auth/login" severity="success" />

            <!-- Scanner Icon Button -->
            <!-- <Button icon="pi pi-qrcode" class="p-button-rounded p-button-success" aria-label="Scanner" /> -->
          </div>
        </div>
      </div>

      <div id="hero" class="flex flex-col pt-6 px-6 lg:px-20 overflow-hidden relative" style="
          background: linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.2),
              rgba(255, 255, 255, 0.2)
            ),
            radial-gradient(
              77.36% 256.97% at 77.36% 57.52%,
              rgb(100, 149, 237) 0%,
              rgb(135, 206, 235) 100%
            );
          clip-path: ellipse(150% 87% at 93% 14%);
          height: 100vh;
        ">
        <div class="absolute inset-0" style="
            background-image: url(&quot;https://kernwater.com/wp-content/uploads/2020/12/kern-4-of-12.jpg&quot;);
            background-size: cover;
            opacity: 0.7;
          "></div>
        <div class="mx-6 md:mx-20 mt-0 md:mt-20 relative z-10">
          <h1 class="text-7xl font-semibold text-blue-500 leading-tight drop-shadow-sm" style="
              position: relative;
              top: 100px;
              filter: drop-shadow(0 3px 2px rgb(0 0 0 / 0.6));
            ">
            Welcome
            <span class="block">Home</span>
          </h1>

          <p class="font-normal text-2xl leading-normal md:mt-4 text-gray-700"
            style="position: relative; top: 100px; color: white">
            Come to our station Efficient water refilling station management
            <br />
            transforms a basic necessity into a sustainable service, ensuring
            <br />
            every drop is accounted for and every customer is satisfied.
          </p>
        </div>
        <div class="flex justify-center md:justify-end">
          <img src="/demo/images/art.png" alt="Hero Image" style="
              width: 700px;
              height: 450px;
              position: relative;
              left: 50px;
              bottom: 50px;
              filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
            " />
        </div>
      </div>

      <div id="aboutus" class="py-6 px-6 lg:px-20 mt-8 mx-0 lg:mx-20">
        <div class="grid grid-cols-12 gap-4 justify-center">
          <div class="col-span-12 mt-20 mb-20 p-2 md:p-20 shadow-md" style="
              border-radius: 20px;
              background: linear-gradient(
                  0deg,
                  rgba(255, 255, 255, 0.6),
                  rgba(255, 255, 255, 0.6)
                ),
                radial-gradient(
                  77.36% 256.97% at 77.36% 57.52%,
                  #f9e79f 0%,
                  #85c1e9 100%
                );
            ">
            <div class="flex flex-col justify-center items-center text-center px-4 py-4 md:py-0">
              <div class="text-gray-900 mb-2 text-3xl font-semibold">
                About us
              </div>
              <p class="text-gray-900 sm:line-height-2 md:line-height-4 text-2xl mt-6" style="max-width: 800px">
                WaterPort Refilling Station <br />
                Dakit, Bogo City, Cebu <br />
                Monday-Saturday 8:00 AM - 5:00 PM
              </p>
            </div>
          </div>
        </div>
        <div class="text-center">
          <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">
            Powerful Everywhere
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4 mt-20 pb-2 md:pb-20">
          <div class="flex justify-center col-span-12 lg:col-span-6 p-0 order-1 lg:order-none"
            style="border-radius: 8px">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/3ea57877a3c73263837fc99720e06cff4fe04064615cbb6ef71ec1032cd2ecb8?placeholderIfAbsent=true&apiKey=8205138dbf9646f198b9f4c85c0a161f"
              class="w-11/12" alt="mockup" />
          </div>

          <div class="col-span-12 lg:col-span-6 my-auto flex flex-col lg:items-end text-center lg:text-right gap-4">
            <div class="flex items-center justify-center bg-purple-200 self-center lg:self-end"
              style="width: 4.2rem; height: 4.2rem; border-radius: 10px">
              <i class="pi pi-fw pi-mobile !text-4xl text-purple-700"></i>
            </div>
            <div class="leading-none text-surface-900 dark:text-surface-0 text-3xl font-normal">
              Cellphone
            </div>
            <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal ml-0 md:ml-2"
              style="max-width: 650px">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ducimus
              hic impedit optio sint nihil. Sit minima harum quis, quo assumenda
              blanditiis ut distinctio eveniet vitae asperiores maxime voluptate
              est dicta!</span>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4 my-20 pt-2 md:pt-20">
          <div class="col-span-12 lg:col-span-6 my-auto flex flex-col text-center lg:text-left lg:items-start gap-4">
            <div class="flex items-center justify-center bg-yellow-200 self-center lg:self-start"
              style="width: 4.2rem; height: 4.2rem; border-radius: 10px">
              <i class="pi pi-fw pi-desktop !text-3xl text-yellow-700"></i>
            </div>
            <div class="leading-none text-surface-900 dark:text-surface-0 text-3xl font-normal">
              PC
            </div>
            <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal mr-0 md:mr-2"
              style="max-width: 650px">Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Pariatur, aliquid. Facere officia id neque, placeat magni tempore.
              Repellat, odio ut? Nihil a quis excepturi nesciunt architecto
              ipsum nostrum commodi culpa.
            </span>
          </div>

          <div class="flex justify-end order-1 sm:order-2 col-span-12 lg:col-span-6 p-0" style="border-radius: 8px">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/3ea57877a3c73263837fc99720e06cff4fe04064615cbb6ef71ec1032cd2ecb8?placeholderIfAbsent=true&apiKey=8205138dbf9646f198b9f4c85c0a161f"
              class="w-11/12" alt="mockup" />
          </div>
        </div>
      </div>

      <div id="testi" class="py-6 px-6 lg:px-20 mt-8 mx-0 lg:mx-20"
        style="background-color: #85c1e9; border-radius: 10px">
        <div class="text-center mb-6">
          <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">
            Testimonials
          </div>
          <span class="text-muted-color text-2xl">What Our Customers Say</span>
        </div>

        <div class="testimonial-carousel">
          <div class="testimonial-container" v-for="(product, index) in visibleProducts" :key="product.id">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md testimonial-box">
              <div class="flex items-center mb-4">
                <img :src="product.image" alt="" class="rounded-full mr-4"
                  style="height: 90px; width: 90px; object-fit: cover" />
                <div>
                  <h5 class="font-semibold text-surface-900 dark:text-surface-0">
                    {{ product.name }}
                  </h5>
                  <p class="text-surface-700 dark:text-surface-100">
                    {{ product.title }}
                  </p>
                </div>
              </div>
              <p class="text-surface-900 dark:text-surface-0 italic">
                "{{ product.testimonial }}"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div id="delivery-schedules" class="py-6 px-6 lg:px-20 my-2 md:my-6">
        <div class="text-center mb-6">
          <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">
            Delivery Schedules
          </div>
          <span class="text-muted-color text-2xl">Upcoming deliveries</span>
        </div>

        <div class="grid grid-cols-12 gap-4 justify-between mt-10 shadow-md">
          <!-- Delivery Schedule Section -->
          <div class="col-span-12">
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white dark:bg-surface-800 rounded-lg shadow-md">
                <thead>
                  <tr class="text-left border-b-2 border-surface-200 dark:border-surface-600">
                    <th class="p-4 text-surface-900 dark:text-surface-0">
                      Area
                    </th>
                    <th class="p-4 text-surface-900 dark:text-surface-0">
                      Date
                    </th>
                    <th class="p-4 text-surface-900 dark:text-surface-0">
                      Agent
                    </th>
                    <th class="p-4 text-surface-900 dark:text-surface-0">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Sample Data Row 1 -->
                  <tr class="border-b border-surface-200 dark:border-surface-600">
                    <td class="p-4 text-surface-900 dark:text-surface-0">
                      Guadalupe Bogo City Cebu
                    </td>
                    <td class="p-4 text-surface-900 dark:text-surface-0">
                      10/20/2024
                    </td>
                    <td class="p-4 text-surface-900 dark:text-surface-0">
                      Ezekiel Angelo Pelayo
                    </td>
                    <td class="p-4">
                      <span class="text-blue-500">Ongiong</span>
                    </td>
                  </tr>
                  <!-- Sample Data Row 2 -->
                  <tr class="border-b border-surface-200 dark:border-surface-600">
                    <td class="p-4 text-surface-900 dark:text-surface-0">
                      Nailon Bogo City Cebu
                    </td>
                    <td class="p-4 text-surface-900 dark:text-surface-0">
                      10/25/2024
                    </td>
                    <td class="p-4 text-surface-900 dark:text-surface-0">
                      Jemar Diamante
                    </td>
                    <td class="p-4">
                      <span class="text-green-500">Completed</span>
                    </td>
                  </tr>
                  <!-- Sample Data Row 3 -->
                  <tr class="border-b border-surface-200 dark:border-surface-600">
                    <td class="p-4 text-surface-900 dark:text-surface-0">
                      Lapaz Bogo City Cebu
                    </td>
                    <td class="p-4 text-surface-900 dark:text-surface-0">
                      11/10/2024
                    </td>
                    <td class="p-4 text-surface-900 dark:text-surface-0">
                      Anton Retuya
                    </td>
                    <td class="p-4">
                      <span class="text-red-500">Delayed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div id="delivery-schedules" class="py-6 px-6 lg:px-20 my-2 md:my-6">
        <div class="text-center mb-6">
          <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">
            Delivery Location Map
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4 justify-between mt-10">
          <!-- Delivery Schedule Section -->
          <div class="col-span-12">
            <div class="overflow-x-auto">
              <!-- Map Section -->
              <div class="mt-10 shadow-md">
                <div class="map-container">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106579.66975452998!2d124.0329799807114!3d10.610103019469285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33b58ab81fd35ff9%3A0x3f5f799ff70809!2sBogo%20City%2C%20Cebu%2C%20Philippines!5e0!3m2!1sen!2sau!4v1638656346795!5m2!1sen!2sau"
                    width="100%" height="450" style="border: 0" allowfullscreen="" loading="lazy"></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="contact" class="py-8 px-6 mx-0 mt-20 lg:mx-0 md:h-80" style="background-color: #01488a">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-10 md:col-span-1"></div>

          <div class="col-span-12 md:col-span-10 mt-6">
            <div class="grid grid-cols-12 gap-8 text-center md:text-left">
              <div class="col-span-12 md:col-span-3">
                <h4 class="font-semibold text-2xl leading-normal mb-4 text-white text-surface-900 dark:text-surface-0">
                  Resources
                </h4>
                <a
                  class="leading-normal text-xl block cursor-pointer text-white mb-2 text-surface-700 dark:text-surface-100">
                  Home</a>
                <a
                  class="leading-normal text-xl block cursor-pointer text-white mb-2 text-surface-700 dark:text-surface-100">About
                  us</a>
              </div>

              <div class="col-span-12 md:col-span-3">
                <h4 class="font-semibold text-2xl leading-normal mb-4 text-white text-surface-900 dark:text-surface-0">
                  Community
                </h4>
                <a
                  class="leading-normal text-xl block cursor-pointer text-white mb-2 text-surface-700 dark:text-surface-100">Testimonials</a>
                <a
                  class="leading-normal text-xl block cursor-pointer text-white mb-2 text-surface-700 dark:text-surface-100">Delivery
                  Schedules</a>
                <a
                  class="leading-normal text-xl block cursor-pointer text-white text-surface-700 dark:text-surface-100">Delivery
                  Location Map</a>
              </div>

              <div class="col-span-12 md:col-span-3">
                <h4 class="font-semibold text-2xl leading-normal mb-4 text-white text-surface-900 dark:text-surface-0">
                  Legal
                </h4>
                <a
                  class="leading-normal text-xl block cursor-pointer text-white mb-2 text-surface-700 dark:text-surface-100">Privacy
                  Policy</a>
                <a
                  class="leading-normal text-xl block cursor-pointer text-white text-surface-700 dark:text-surface-100">Terms
                  of Service</a>
              </div>

              <div class="col-span-12 md:col-span-3">
                <h4 class="font-semibold text-2xl leading-normal mb-4 text-white text-surface-900 dark:text-surface-0">
                  Social
                </h4>
                <div class="flex flex-row space-x-4">
                  <a href="">
                    <img src="/demo/images/fb.png" alt="" class="w-8 h-auto max-w-full" />
                  </a>
                  <a href="">
                    <img src="/demo/images/tlp.png" alt="" class="w-8 h-auto max-w-full" />
                  </a>
                  <a href="">
                    <img src="/demo/images/twit.png" alt="" class="w-8 h-auto max-w-full" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrolltop {
  transition: background-color 0.3s ease;
}

.custom-scrolltop:hover {
  background-color: info !important;
  /* Use !important if needed */
}

.menu-item {
  color: #63a8ed;
  text-decoration: none;
  /* Remove underline */
  position: relative;
  /* For the hover effect */
}

.menu-item:hover {
  text-decoration: none;
  /* Keep it clean */
}

.menu-item::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  /* Adjust as needed */
  height: 2px;
  /* Thickness of the underline */
  background-color: #50a0f0;
  /* Color of the underline */
  transform: scaleX(0);
  /* Initially hide the underline */
  transition: transform 0.3s ease;
  /* Animation */
}

.menu-item:hover::after {
  transform: scaleX(1);
  /* Show underline on hover */
}

.map-container {
  width: 100%;
  /* Adjusts to fill the available space */
  height: 450px;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 20px;
}

.testimonial-carousel {
  display: flex;
  overflow: hidden;
  /* Hides overflow for a neat look */
}

.testimonial-container {
  flex: 0 0 33.33%;
  /* Each testimonial takes up 1/3 of the container */
  padding: 0 10px;
  /* Adds spacing between testimonials */
}

.testimonial-box {
  height: 200px;
  /* Set a fixed height for all testimonial boxes */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* Space out elements evenly */
}
</style>
