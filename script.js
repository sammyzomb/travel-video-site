<!-- Contentful SDK + 全域初始化 -->
<script src="https://cdn.jsdelivr.net/npm/contentful@latest/dist/contentful.browser.min.js"></script>
<script>
  window.contentfulClient = contentful.createClient({
    space:'os5wf90ljenp', accessToken:'lODH-WLwHwVZv7O4rFdBWjSnrzaQWGD4koeOZ1Dypj0'
  });
  window.escapeHtml = s => String(s||'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
</script>

<!-- 拆分後的 4 支程式 -->
<script src="core.js"></script>
<script src="https://www.youtube.com/iframe_api"></script>
<script src="media.js"></script>
<script src="featured.js"></script>
<script src="upnext.js"></script>
