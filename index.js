function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const plugin = (hook, vm) => {
  const repo = vm.config.repo;

  hook.beforeEach(html => {
    const { file, path } = vm.route;
    let text = vm.config.lastModifiedText || "";
    if (typeof text === "object") {
      Object.keys(text).some(local => {
        const isMatch = path && path.indexOf(local) > -1;
        text = isMatch ? text[local] : text;
        return isMatch;
      });
    }

    const apiUrl = `https://api.github.com/repos/${repo}/commits?path=${file}`;
    fetch(apiUrl, { method: "GET" })
      .then(response => response.json())
      .then(data => {
        const date = data[0].commit.committer.date;
        const commitUrl = `https://github.com/${repo}/commits/main/${file}`;
        const lastModified = formatDateTime(date);
        const lastModifiedContent = `
          <blockquote>
           <a href="${commitUrl}" target="_blank" style="color: #858585">${text +
          lastModified}</a>
           </blockquote>
          `;
        document.getElementById(
          "last-modified"
        ).innerHTML = lastModifiedContent;
      });
    return html + '<span id="last-modified"></span>';
  });
};

window.$docsify = window.$docsify || {};
window.$docsify.plugins = (window.$docsify.plugins || []).concat(plugin);
